import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useLineTracingStore } from '../store/lineTracing.store';
import axios from 'axios';
import './LineTracingPage.css';

const LineTracingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    gameState, score, timeElapsed, progress, pathPoints, lineWidth,
    penalties, isOffPath, graceTimeRemaining,
    generatePath, startGame, completeGame, updateProgress,
    resetGame, goOffPath, returnToPath
  } = useLineTracingStore();

  const { isAuthenticated, token } = useAuthStore();

  // Cursor tooltip to track the state
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isOverStartZone, setIsOverStartZone] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Cleanup
  useEffect(() => {
    return () => resetGame();
  }, [resetGame]);

  // Wait for container size before building path
  useEffect(() => {
    if (gameState === 'NotStarted' && containerRef.current) {
        setTimeout(() => {
            if(containerRef.current) {
                generatePath(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
            }
        }, 100);
    }
  }, [gameState, generatePath]);

  // CANVAS DRAWING
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pathPoints.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawCurve = () => {
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
        ctx.stroke();
    };

    // Draw Border
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth + 4;
    ctx.strokeStyle = '#555';
    drawCurve();

    // Draw Main Path
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#222';
    drawCurve();

    const start = pathPoints[0];
    const end = pathPoints[pathPoints.length - 1];

    // Start Zone
    ctx.beginPath();
    ctx.arc(start.x, start.y, lineWidth, 0, Math.PI * 2);
    ctx.fillStyle = '#646cff';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('START', start.x - 25, start.y + 5);

    // End Zone
    ctx.beginPath();
    ctx.arc(end.x, end.y, lineWidth, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText('FINISH', end.x - 25, end.y + 5);

  }, [pathPoints, lineWidth, gameState]); // Redraw on state change just in case


  // MOUSE MOVEMENT
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPos({ x: e.clientX, y: e.clientY });

    // "Not Started" Hover
    if (gameState === 'NotStarted' && pathPoints.length > 0) {
        const start = pathPoints[0];
        const distStart = Math.sqrt(Math.pow(x - start.x, 2) + Math.pow(y - start.y, 2));
        if (distStart <= lineWidth) {
            setIsOverStartZone(true);
        } else {
            setIsOverStartZone(false);
        }
        return;
    }

    // Game Logic
    if (gameState !== 'InProgress') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Re-trace path for collision detection
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

    // Check wall Collision
    if (ctx.isPointInStroke(x, y) || ctx.isPointInPath(x,y)) {
        returnToPath();

        // Check Win Condition
        const end = pathPoints[pathPoints.length - 1];
        const distEnd = Math.sqrt(Math.pow(x - end.x, 2) + Math.pow(y - end.y, 2));
        if (distEnd <= lineWidth) {
            completeGame();
            return;
        }

        // Calculate Progress
        const totalDist = pathPoints[pathPoints.length-1].x - pathPoints[0].x;
        const currentDist = x - pathPoints[0].x;
        const pct = Math.max(0, Math.min(100, (currentDist / totalDist) * 100));
        updateProgress(pct);

    } else {
        // User is OFF path
        // Check if they are still in the start zone (safe)
        const start = pathPoints[0];
        const distStart = Math.sqrt(Math.pow(x - start.x, 2) + Math.pow(y - start.y, 2));

        if (distStart > lineWidth) {
             goOffPath();
        }
    }
  };

  // CLICK TO START LOGIC
  const handleCanvasClick = () => {
      if (gameState === 'NotStarted' && isOverStartZone) {
          startGame();
          setIsOverStartZone(false);
      }
  };

  // Generate New Path Button
  const handleGeneratePath = () => {
    if(containerRef.current) {
        generatePath(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
        setIsPreviewing(true); // Hiding the overlay
    }
  };

  // Save Score Effect
  useEffect(() => {
    const save = async () => {
        if ((gameState === 'Finished' || gameState === 'Failed') && isAuthenticated && token) {
            try {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/attempts`, {
                    challengeType: 'Line Tracing',
                    score: score,
                    completionTime: timeElapsed,
                    accuracy: progress / 100,
                    ntpm: penalties, // Storing penalties in ntpm field (for now)
                    settings: { mode: 'Normal' }
                }, { headers: { Authorization: `Bearer ${token}` } });
                console.log("Line Tracing Score Saved");
            } catch(e) { console.error(e); }
        }
    };
    save();
  }, [gameState, isAuthenticated, token, score, timeElapsed, progress, penalties]);

  return (
    <div className="line-tracing-wrapper">
        <div className="tracing-hud">
            <div>Time: {timeElapsed.toFixed(1)}s</div>
            <div style={{color: penalties > 0 ? '#ff6b6b' : 'inherit'}}>
                Penalties: {penalties}
            </div>
            <div>Progress: {progress.toFixed(1)}%</div>
        </div>

        <div className="canvas-container" ref={containerRef}>
            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onClick={handleCanvasClick}
                className={
                    gameState === 'InProgress' ? 'active-cursor' :
                    (gameState === 'NotStarted' && isOverStartZone) ? 'pointer-cursor' : ''
                }
            />

            {/* Start Overlay */}
            {gameState === 'NotStarted' && !isPreviewing && (
                <div className="game-overlay">
                    <h1>Line Tracing</h1>
                    <p>Trace the line from Start to Finish. Don't go outside the path!</p>
                    <p style={{color: '#8187ff', fontWeight: 'bold', marginTop: '1rem'}}>
                        Click the START CIRCLE to begin.
                    </p>
                    <button onClick={handleGeneratePath} className="cta-button secondary">
                        Generate New Path
                    </button>
                </div>
            )}

             {/* Adding a small 'Back to Menu' button just in case someone doesn't like the path. */}
            {gameState === 'NotStarted' && isPreviewing && (
                 <div style={{position: 'absolute', top: 20, right: 20, zIndex: 30}}>
                    <button onClick={() => setIsPreviewing(false)} className="cta-button secondary" style={{fontSize: '0.8rem', padding: '0.5rem 1rem'}}>
                        Show Instructions
                    </button>
                    <button onClick={handleGeneratePath} className="cta-button" style={{fontSize: '0.8rem', padding: '0.5rem 1rem', marginLeft: '1rem'}}>
                        New Path
                    </button>
                 </div>
            )}

            {/* Failure Overlay */}
            {gameState === 'Failed' && (
                <div className="game-overlay">
                    <h1 style={{color: '#ff6b6b'}}>Failed!</h1>
                    <p>You went off the path.</p>
                    <p>Distance: {progress.toFixed(1)}%</p>
                    <div className="button-group">
                        <button onClick={() => {
                            resetGame();
                            if(containerRef.current) generatePath(containerRef.current.offsetWidth, containerRef.current.offsetHeight, pathPoints);
                        }} className="cta-button">Retry Path</button>
                        <button onClick={() => {
                            resetGame();
                            if(containerRef.current) generatePath(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
                        }} className="cta-button secondary">New Path</button>
                    </div>
                </div>
            )}

            {/* Success Overlay */}
            {gameState === 'Finished' && (
                <div className="game-overlay">
                    <h1 style={{color: '#2ecc71'}}>Success!</h1>
                    <p>Time: {timeElapsed.toFixed(2)}s</p>
                    <p>Penalties: {penalties}</p>
                    <p>Score: {score}</p>
                    <div className="button-group">
                        <button onClick={() => {
                            resetGame();
                            if(containerRef.current) generatePath(containerRef.current.offsetWidth, containerRef.current.offsetHeight, pathPoints);
                        }} className="cta-button">Retry Path</button>
                        <button onClick={() => {
                            resetGame();
                            if(containerRef.current) generatePath(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
                        }} className="cta-button secondary">New Path</button>
                    </div>
                </div>
            )}
        </div>

        {/* Tooltip for Start Zone */}
        {gameState === 'NotStarted' && isOverStartZone && (
             <div
                className="cursor-tooltip start-hint"
                style={{ left: cursorPos.x + 15, top: cursorPos.y + 15 }}
            >
                Click to Start!
            </div>
        )}

        {/* Warning Tooltip (Grace Period) */}
        {gameState === 'InProgress' && isOffPath && (
            <div
                className="cursor-tooltip warning"
                style={{ left: cursorPos.x + 15, top: cursorPos.y + 15 }}
            >
                RETURN TO PATH! {graceTimeRemaining.toFixed(1)}s
            </div>
        )}

        {/* Normal Progress Tooltip */}
        {gameState === 'InProgress' && !isOffPath && (
            <div
                className="cursor-tooltip"
                style={{ left: cursorPos.x + 15, top: cursorPos.y + 15 }}
            >
                {progress.toFixed(0)}%
            </div>
        )}
    </div>
  );
};

export default LineTracingPage;