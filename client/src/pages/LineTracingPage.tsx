import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useLineTracingStore, type Point } from '../store/lineTracing.store';
import axios from 'axios';
import './LineTracingPage.css';

const LineTracingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    gameState, score, timeElapsed, progress, pathPoints, lineWidth,
    generatePath, startGame, failGame, completeGame, updateProgress, resetGame
  } = useLineTracingStore();

  const { isAuthenticated, token } = useAuthStore();

  // Cursor follower tooltip - track state
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Cleanup
  useEffect(() => {
    return () => resetGame();
  }, [resetGame]);

  // Initial Path Generation (need to wait for container size or else this doesn't work right)
  useEffect(() => {
    if (gameState === 'NotStarted' && containerRef.current) {
        // slight timeout to ensure layout is done
        setTimeout(() => {
            if(containerRef.current) {
                generatePath(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
            }
        }, 100);
    }
  }, [gameState, generatePath]);

  // Ok, the path drawing logic...
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pathPoints.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Drawing the "track"
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#333';

    // Helper to draw the curve
    const drawCurve = () => {
        ctx.beginPath();
        ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
        // Spline logic for smooth curve through points
        for (let i = 0; i < pathPoints.length - 1; i++) {
            const p0 = i > 0 ? pathPoints[i - 1] : pathPoints[0];
            const p1 = pathPoints[i];
            const p2 = pathPoints[i + 1];
            const p3 = i != pathPoints.length - 2 ? pathPoints[i + 2] : p2;

            // Simple Bezier approximation for smoothing between points
            // Note: For a true path trace, we often use Quadratic curves between midpoints
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            if (i === 0) {
                 ctx.lineTo(midX, midY); // Start line
            } else if (i === pathPoints.length - 2) {
                 ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
            } else {
                 ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
            }
        }
        ctx.stroke();
    };

    // Draw "Border" of path first (slightly wider)
    ctx.lineWidth = lineWidth + 4;
    ctx.strokeStyle = '#555';
    drawCurve();

    // Draw Main Path
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#222';
    drawCurve();

    // Draw Start and End Zones
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

    // End Zone (Finish Line)
    ctx.beginPath();
    ctx.arc(end.x, end.y, lineWidth, 0, Math.PI * 2);
    ctx.fillStyle = '#27ae60';
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText('FINISH', end.x - 25, end.y + 5);

  }, [pathPoints, lineWidth]);


  // Collison logic - NEED TO USE HTMLCANVAS
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'InProgress') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update cursor tooltip pos
    setCursorPos({ x: e.clientX, y: e.clientY });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Note: To make this robust, I should cache the Path2D object... eventually

    // Re-define the path
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

    // CRITICAL: Same line width for detection
    ctx.lineWidth = lineWidth;

    // Check if user is ON the line
    if (ctx.isPointInStroke(x, y) || ctx.isPointInPath(x,y)) {
        const end = pathPoints[pathPoints.length - 1];
        const distEnd = Math.sqrt(Math.pow(x - end.x, 2) + Math.pow(y - end.y, 2));

        if (distEnd <= lineWidth) {
            completeGame();
            return;
        }

        // Calculate rough progress based on X position relative to width
        const totalDist = pathPoints[pathPoints.length-1].x - pathPoints[0].x;
        const currentDist = x - pathPoints[0].x;
        const pct = Math.max(0, Math.min(100, (currentDist / totalDist) * 100));
        updateProgress(pct);

    } else {
        // User went OFF the line!
        // Allow a small grace period or distance maybe?? Strict mode for now...
        // maybe if you hit the wall, you have 1 second to come back, but negative points?

        // However, check if they are in the Start zone
        const start = pathPoints[0];
        const distStart = Math.sqrt(Math.pow(x - start.x, 2) + Math.pow(y - start.y, 2));

        if (distStart > lineWidth) {
             failGame();
        }
    }
  };

  const handleStartGame = () => {
    // I need to add a start trigger where the mouse crosses the left side of the start... not a start button
    // So, instead of start game, maybe build path
    startGame();
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
                    accuracy: progress / 100, // 0 to 1
                    settings: { mode: 'Normal' } // No advanced mode yet
                }, { headers: { Authorization: `Bearer ${token}` } });
            } catch(e) { console.error(e); }
        }
    };
    save();
  }, [gameState]);

  return (
    <div className="line-tracing-wrapper">
        {/* HUD */}
        <div className="tracing-hud">
            <div>Time: {timeElapsed.toFixed(1)}s</div>
            <div>Progress: {progress.toFixed(1)}%</div>
        </div>

        <div className="canvas-container" ref={containerRef}>
            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                className={gameState === 'InProgress' ? 'active-cursor' : ''}
            />

            {/* Overlays */}
            {gameState === 'NotStarted' && (
                <div className="game-overlay">
                    <h1>Line Tracing</h1>
                    <p>Trace the line from Start to Finish. Don't go outside the path!</p>
                    <button onClick={handleStartGame} className="cta-button">Start Challenge</button>
                </div>
            )}

            {gameState === 'Failed' && (
                <div className="game-overlay">
                    <h1 style={{color: '#ff6b6b'}}>Failed!</h1>
                    <p>You went off the path.</p>
                    <p>Distance: {progress.toFixed(1)}%</p>
                    <div className="button-group">
                        <button onClick={() => {
                            resetGame();
                            generatePath(canvasRef.current!.width, canvasRef.current!.height, pathPoints);
                        }} className="cta-button">Retry Path</button>
                        <button onClick={() => {
                            resetGame();
                            generatePath(canvasRef.current!.width, canvasRef.current!.height);
                        }} className="cta-button secondary">New Path</button>
                    </div>
                </div>
            )}

            {gameState === 'Finished' && (
                <div className="game-overlay">
                    <h1 style={{color: '#2ecc71'}}>Success!</h1>
                    <p>Time: {timeElapsed.toFixed(2)}s</p>
                    <p>Score: {score}</p>
                    <button onClick={() => {
                         resetGame();
                         generatePath(canvasRef.current!.width, canvasRef.current!.height);
                    }} className="cta-button">Next Challenge</button>
                </div>
            )}
        </div>

        {/* Cursor Tooltip */}
        {gameState === 'InProgress' && (
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