import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useLineTracingStore } from '../store/lineTracing.store';
import axios from 'axios';
import LineTraceStatCard from '../components/dashboard/stat-cards/LineTraceStatCard';
import GameRulesSidebar from '../components/game/GameRulesSidebar';
import { useSocketStore } from '../store/socket.store';
import { type Attempt } from '../types/challenge.types';
import './LineTracingPage.css';


const MAX_OFF_PATH_DISTANCE = 150;
const MAX_PROGRESS_JUMP = 5;

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  className?: string;
}

const LineTracingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    gameState, score, timeRemaining, progress, pathPoints, lineWidth,
    penalties, isOffPath, graceTimeRemaining, failReason,
    generatePath, startGame, completeGame, updateProgress,
    resetGame, goOffPath, returnToPath, failGame,
    lastValidPosition, updateLastValidPosition, exitProgress
  } = useLineTracingStore();

  const { isAuthenticated, token } = useAuthStore();

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isOverStartZone, setIsOverStartZone] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Stats State
  const [userAttempts, setUserAttempts] = useState<Attempt[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fixed dimensions
  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 600;

  // Floating Text State
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Websocket functions
  const { emitGameUpdate, emitGameEnd } = useSocketStore();

  // Mix of Store for game and websocket
  useEffect(() => {
      return () => {
          resetGame();
          emitGameEnd();
      };
  }, [resetGame, emitGameEnd]);

  // Let's get the Stats Card
  useEffect(() => {
    const fetchAttempts = async () => {
      if (isAuthenticated && token) {
        setLoadingStats(true);
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/attempts/my-attempts`, config);
          setUserAttempts(response.data);
        } catch (error) {
          console.error("Failed to fetch user stats:", error);
        } finally {
          setLoadingStats(false);
        }
      } else {
        setLoadingStats(false);
      }
    };
    fetchAttempts();
  }, [isAuthenticated, token, gameState]);

  // Generate path on mount
  useEffect(() => {
    if (pathPoints.length === 0) {
        generatePath(CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, [generatePath, pathPoints.length]);

  // Socket Telemetry (real-time data)
   useEffect(() => {
    let interval: number;

    const sendUpdate = () => {
        const state = useLineTracingStore.getState();
        emitGameUpdate({
            type: 'Line Tracing',
            score: state.score || 0,
            timeRemaining: state.timeRemaining,
            progress: state.progress || 0,
            misses: state.penalties || 0,
            mode: 'Normal',
            speed: '-',
            status: 'InProgress'
        });
    };

    if (gameState === 'InProgress') {
        sendUpdate(); // Send immediately on start
        interval = window.setInterval(sendUpdate, 200);

    } else if (gameState === 'Finished' || gameState === 'Failed') {
        // Emit the final update with the result
        emitGameUpdate({
            type: 'Line Tracing',
            score,
            timeRemaining,
            progress,
            misses: penalties,
            mode: 'Normal',
            speed: '-',
            status: gameState // 'Finished' or 'Failed'
        });
        // Tell server we are done (which triggers the 10s timeout on server)
        emitGameEnd();
    }

    return () => clearInterval(interval);
  }, [gameState, score, timeRemaining, progress, penalties, emitGameUpdate, emitGameEnd]);

  // CANVAS DRAWING
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pathPoints.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const definePath = () => {
        ctx.beginPath();
        ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let i = 0; i < pathPoints.length - 1; i++) {
            const p1 = pathPoints[i];
            const p2 = pathPoints[i + 1];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            if (i === 0) ctx.lineTo(midX, midY);
            else if (i === pathPoints.length - 2) ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
            else ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
        }
    };

    definePath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth + 4;
    ctx.strokeStyle = '#555';
    ctx.stroke();

    definePath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#222';
    ctx.stroke();

    const start = pathPoints[0];
    const end = pathPoints[pathPoints.length - 1];

    ctx.beginPath();
    ctx.arc(start.x, start.y, lineWidth/1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#646cff';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('START', start.x - 25, start.y + 5);

    ctx.beginPath();
    ctx.arc(end.x, end.y, lineWidth/1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText('FINISH', end.x - 25, end.y + 5);

  }, [pathPoints, lineWidth, gameState]);


  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCursorPos({ x: e.clientX, y: e.clientY });

    if (gameState === 'NotStarted' && pathPoints.length > 0) {
        const start = pathPoints[0];
        const distStart = Math.sqrt(Math.pow(x - start.x, 2) + Math.pow(y - start.y, 2));
        setIsOverStartZone(distStart <= lineWidth);
        return;
    }

    if (gameState !== 'InProgress') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
    for (let i = 0; i < pathPoints.length - 1; i++) {
        const p1 = pathPoints[i];
        const p2 = pathPoints[i + 1];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        if (i === 0) ctx.lineTo(midX, midY);
        else if (i === pathPoints.length - 2) ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
        else ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
    }
    ctx.lineWidth = lineWidth;

    const isOnPath = ctx.isPointInStroke(x, y);
    // const totalDist = pathPoints[pathPoints.length-1].x - pathPoints[0].x; // Pending enhancement
    const currentDist = x - pathPoints[0].x;
    // totalDist logic for percent
    const totalPathWidth = pathPoints[pathPoints.length - 1].x - pathPoints[0].x;
    const currentPct = Math.max(0, Math.min(100, (currentDist / totalPathWidth) * 100));

    if (isOnPath) {
        if (isOffPath) {
            const jumpSize = currentPct - exitProgress;
            if (jumpSize > MAX_PROGRESS_JUMP) {
                failGame("Section Skip Detected! Please try again!");
                return;
            }
            returnToPath();
        }
        updateLastValidPosition({x, y}, currentPct);
        updateProgress(currentPct);

        const end = pathPoints[pathPoints.length - 1];
        const distEnd = Math.sqrt(Math.pow(x - end.x, 2) + Math.pow(y - end.y, 2));
        if (distEnd <= lineWidth) {
            completeGame();
        }
    } else {
        // Floating Penalty
        if (!isOffPath) {
             const PENALTY_AMOUNT = 500;
             const penaltyText: FloatingText = {
                id: Date.now(),
                x: e.clientX,
                y: e.clientY,
                text: `-${PENALTY_AMOUNT}`,
                className: 'penalty',
             };
             setFloatingTexts(prev => [...prev, penaltyText]);
             setTimeout(() => {
                setFloatingTexts(prev => prev.filter(ft => ft.id !== penaltyText.id));
             }, 800);
        }

        goOffPath();
        if (lastValidPosition) {
            const distFromValid = Math.sqrt(Math.pow(x - lastValidPosition.x, 2) + Math.pow(y - lastValidPosition.y, 2));
            if (distFromValid > MAX_OFF_PATH_DISTANCE) {
                failGame("Moved too far from the path!");
            }
        }
    }
  };

  const handleCanvasClick = () => {
      if (gameState === 'NotStarted' && isOverStartZone) {
          startGame();
          setIsOverStartZone(false);
      }
  };

  useEffect(() => {
    const save = async () => {
        if ((gameState === 'Finished' || gameState === 'Failed') && isAuthenticated && token) {
            try {
                // Calculated time taken
                // 30.0 to ensure float, though i guess JS does this anyway, if I remember
                const timeTaken = 30 - timeRemaining;

                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/attempts`, {
                    challengeType: 'Line Tracing',
                    score: score,
                    completionTime: timeTaken, // Send actual time
                    accuracy: progress / 100,
                    penalties: penalties,
                    ntpm: undefined,
                    settings: { mode: 'Normal' }
                }, { headers: { Authorization: `Bearer ${token}` } });
            } catch(e) { console.error(e); }
        }
    };
    save();
  }, [gameState, isAuthenticated, token, score, timeRemaining, progress, penalties]);

  return (
    <div className="line-tracing-wrapper" style={{flexDirection: 'column', height: 'auto', minHeight: 'calc(100vh - 80px)'}}>
        <div className="tracing-hud-area">
            <div className="tracing-hud">
                {/* Display Time Remaining */}
                <div>Time: {timeRemaining.toFixed(1)}s</div>
                <div style={{color: penalties > 0 ? '#ff6b6b' : 'inherit'}}>
                    Penalties: {penalties}
                </div>
                <div>Progress: {progress.toFixed(1)}%</div>
            </div>
        </div>

        <div className="tracing-canvas-area">
            <div className="tracing-canvas-wrapper" style={{width: CANVAS_WIDTH, height: CANVAS_HEIGHT}}>
                <canvas
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onClick={handleCanvasClick}
                    className={
                        gameState === 'InProgress' ? 'active-cursor' :
                        (gameState === 'NotStarted' && isOverStartZone) ? 'pointer-cursor' : ''
                    }
                />

                {/* Floating Text */}
                {floatingTexts.map(ft => (
                    <div
                    key={ft.id}
                    className={`floating-score ${ft.className || ''}`}
                    style={{ left: ft.x, top: ft.y }}
                    >
                    {ft.text}
                    </div>
                ))}

                {/* Main Overlay */}
                {gameState === 'NotStarted' && !isPreviewing && (
                    <div className="game-overlay">
                        <h1>Line Tracing</h1>

                        {/* --- Stats Card --- */}
                        {isAuthenticated && !loadingStats && userAttempts.length > 0 && (
                            <div className="stat-card-inline">
                                <h3>Your Stats</h3>
                                <LineTraceStatCard attempts={userAttempts} />
                            </div>
                        )}

                        <p>Trace the line from Start to Finish without leaving the path.</p>
                        <p style={{color: '#8187ff', marginTop: '1rem'}}>
                            Click the START CIRCLE to begin.
                        </p>
                        <button onClick={() => {
                            generatePath(CANVAS_WIDTH, CANVAS_HEIGHT);
                            setIsPreviewing(true);
                        }} className="cta-button secondary">
                            Preview Path & Play
                        </button>
                    </div>
                )}

                {/* Corner Controls */}
                {gameState === 'NotStarted' && isPreviewing && (
                     <div className="corner-controls">
                        <button onClick={() => setIsPreviewing(false)} className="cta-button secondary small">
                            Show Instructions
                        </button>
                        <button onClick={() => generatePath(CANVAS_WIDTH, CANVAS_HEIGHT)} className="cta-button small" style={{marginLeft: '10px'}}>
                            New Path
                        </button>
                     </div>
                )}

                {/* Failure Overlay */}
                {gameState === 'Failed' && (
                    <div className="game-overlay">
                        <h1 style={{color: '#ff6b6b'}}>Failed!</h1>
                        <p>{failReason || "You went off the path."}</p>

                        <div className="score-breakdown" style={{padding: '1rem', width: 'auto'}}>
                            <p style={{fontSize: '1.2rem', margin: 0}}>
                                Distance Traveled: <span>{progress.toFixed(1)}%</span>
                            </p>
                        </div>

                        <div className="button-group">
                            <button onClick={() => {
                                // current path BEFORE reset
                                const currentPath = pathPoints;
                                resetGame();
                                // Pass existing path back in to retry
                                generatePath(CANVAS_WIDTH, CANVAS_HEIGHT, currentPath);
                            }} className="cta-button">
                                Retry Path
                            </button>

                            <button onClick={() => {
                                resetGame();
                                generatePath(CANVAS_WIDTH, CANVAS_HEIGHT); // Generate new path
                            }} className="cta-button secondary">
                                New Path
                            </button>
                        </div>
                    </div>
                )}

                {/* Success Overlay */}
                {gameState === 'Finished' && (
                    <div className="game-overlay">
                        <h1 style={{color: '#2ecc71'}}>Success!</h1>

                        <div className="score-breakdown">
                            <p>Completion Bonus: <span>+1,000</span></p>
                            <p>Time Bonus: <span>+{Math.round(timeRemaining * 100).toLocaleString()}</span></p>
                            <p style={{color: '#ff6b6b'}}>Penalties: <span>-{ (penalties * 500).toLocaleString() }</span></p>
                            <div className="score-divider"></div>
                            <p className="final-score">Final Score: <span>{score.toLocaleString()}</span></p>
                        </div>

                        {/* Retry or new */}
                        <div className="button-group">
                            <button onClick={() => {
                                const currentPath = pathPoints;
                                resetGame();
                                generatePath(CANVAS_WIDTH, CANVAS_HEIGHT, currentPath);
                                setIsPreviewing(true); // Go to start screen
                            }} className="cta-button">
                                Retry Path
                            </button>

                            <button onClick={() => {
                                 resetGame();
                                 generatePath(CANVAS_WIDTH, CANVAS_HEIGHT);
                                 setIsPreviewing(true); // Preview new path
                            }} className="cta-button secondary">
                                New Path
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <GameRulesSidebar mode="Line Tracing" />

        {/* Tooltips */}
        {gameState === 'NotStarted' && isOverStartZone && (
             <div className="cursor-tooltip start-hint" style={{ left: cursorPos.x + 15, top: cursorPos.y + 15 }}>
                Click to Start
            </div>
        )}
        {gameState === 'InProgress' && isOffPath && (
            <div className="cursor-tooltip warning" style={{ left: cursorPos.x + 15, top: cursorPos.y + 15 }}>
                RETURN TO PATH! {graceTimeRemaining.toFixed(1)}s
            </div>
        )}
        {gameState === 'InProgress' && !isOffPath && (
            <div className="cursor-tooltip" style={{ left: cursorPos.x + 15, top: cursorPos.y + 15 }}>
                {progress.toFixed(0)}%
            </div>
        )}
    </div>
  );
};

export default LineTracingPage;