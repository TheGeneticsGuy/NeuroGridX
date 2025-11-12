import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useGameStore } from '../store/game.store';
import axios from 'axios';
import ReactionTimeStatCard from '../components/dashboard/stat-cards/ReactionTimeStatCard';
import InteractiveTarget from '../components/game/InteractiveTarget'; // Import new component
import { type Attempt } from '../config/challenges.config';
import './ReactionTimePage.css';

const TOTAL_TIME = 60;
const MAX_POINTS = 100;
const MIN_POINTS = 25;

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  className?: string;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / TOTAL_TIME).toString().padStart(2, '0');
  const secs = (seconds % TOTAL_TIME).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const ReactionTimePage: React.FC = () => {
  const {
    gameState, score, hits, misses, timeRemaining, targets, clickAccuracies,
    startGame, handleHit, handleMiss, resetGame
  } = useGameStore();

  const { isAuthenticated, token } = useAuthStore();
  const [userAttempts, setUserAttempts] = useState<Attempt[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]); // The floating scores

  useEffect(() => {
    return () => { resetGame(); };
  }, [resetGame]);

  useEffect(() => {
    const fetchAttempts = async () => {
      if (isAuthenticated && token) {
        setLoadingStats(true);
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/attempts/my-attempts`, config);
          setUserAttempts(response.data);
        } catch (error) {
          console.error("Failed to get user stats:", error);
        } finally {
          setLoadingStats(false);
        }
      } else {
        setLoadingStats(false);
      }
    };
    fetchAttempts();
  }, [isAuthenticated, token, gameState]);

  useEffect(() => {
    const saveScore = async () => {
      const ntpm = hits - misses;
      const averageClickAccuracy = clickAccuracies.length > 0 ? clickAccuracies.reduce((a, b) => a + b, 0) / clickAccuracies.length : 0;

      if (gameState === 'Finished' && isAuthenticated && token) {
        try {
          const finalScore = {
            challengeType: 'Reaction Time', score, completionTime: TOTAL_TIME,
            accuracy: hits > 0 ? hits / (hits + misses) : 0, ntpm, averageClickAccuracy,
          };
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/attempts`, finalScore, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Score saved successfully!");
        } catch (error) {
          console.error("Failed to save score:", error);
        }
      }
    };

    if (gameState === 'Finished') {
      saveScore();
    }
  }, [gameState, isAuthenticated, token, score, hits, misses, clickAccuracies]);

  const onGameAreaClick = () => { handleMiss(); };

  // create the floating text
  const onTargetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const radius = rect.width / 2;
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;
    const dist = Math.sqrt(Math.pow(centerX - e.clientX, 2) + Math.pow(centerY - e.clientY, 2));
    const clickAccuracy = Math.max(0, 1 - (dist / radius));

    const linearPoints = clickAccuracy * MAX_POINTS;
    const points = Math.round(Math.max(MIN_POINTS, linearPoints));

    const BONUS_THRESHOLD = 0.85;
    const BONUS_POINTS = 50;

    // Create floating text
    const baseText: FloatingText = {
      id: Date.now(),
      x: e.clientX, // Appear exactly where clicked
      y: e.clientY,
      text: `+${points}`,
    };

    setFloatingTexts(prev => [...prev, baseText]);
    if (linearPoints >= (BONUS_THRESHOLD * MAX_POINTS)) {
      setTimeout(() => {
        const bonusText: FloatingText = {
          id: Date.now() + 1,
          x: e.clientX,
          y: e.clientY,
          text: `+${BONUS_POINTS} BONUS!`,
          className: 'bonus', // binding to special class
        };
        setFloatingTexts(prev => [...prev, bonusText]);
        setTimeout(() => {
          setFloatingTexts(prev => prev.filter(ft => ft.id !== bonusText.id));
        }, 1000);
      }, 100);
    }

    // Remove it after animation finishes (800ms)
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== baseText.id));
    }, 800);

    handleHit(e.clientX, e.clientY, e.currentTarget);
  };

  const startGameHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    startGame();
  };

  const ntpm = hits - misses;
  const averageClickAccuracy = clickAccuracies.length > 0
    ? (clickAccuracies.reduce((a, b) => a + b, 0) / clickAccuracies.length * 100).toFixed(2)
    : 'N/A';

  return (
    <div className="challenge-page-wrapper">
      {/* HUD code */}
      <div className="challenge-hud-area">
        {gameState === 'InProgress' && (
          <div className="game-hud">
            <div className="hud-item">Time: {formatTime(timeRemaining)}</div>
            <div className="hud-item">Score: {score}</div>
            <div className="hud-item">NTPM: {ntpm}</div>
          </div>
        )}
      </div>

      <div className="challenge-canvas-area">
        <div className="game-canvas" onClick={onGameAreaClick}>
          {/* Start Overlay */}
          {gameState === 'NotStarted' && (
            <div className="game-overlay">
              <h1>Reaction Time Challenge</h1>
              {isAuthenticated && !loadingStats && userAttempts.length > 0 && (
                <div className="stat-card-inline">
                  <h3>Your Stats</h3>
                  <ReactionTimeStatCard attempts={userAttempts} />
                </div>
              )}
              <p>Click as many targets as you can in {TOTAL_TIME} seconds.</p>
              <p>Points are awarded based on how close you click to the center.</p>
              <button onClick={startGameHandler} className="cta-button">
                Start Game
              </button>
            </div>
          )}

          {/* Finish Overlay */}
          {gameState === 'Finished' && (
            <div className="game-overlay">
              <h1>Time's Up!</h1>
              <p>Final Score: {score}</p>
              <p>Total Hits: {hits}</p>
              <p>Total Misses: {misses}</p>
              <p>Net Targets Per Minute (NTPM): {ntpm}</p>
              <p>Average Click Accuracy to Center: {averageClickAccuracy}%</p>
              {isAuthenticated ? <p>Your score has been saved.</p> : <p>Login to save your scores!</p>}
              <button onClick={startGameHandler} className="cta-button">Play Again</button>
            </div>
          )}

          {/* Render Interactive Targets */}
          {gameState === 'InProgress' && targets.map(target => (
            <InteractiveTarget
              key={target.id}
              id={target.id}
              x={target.x}
              y={target.y}
              size={target.size}
              onClick={onTargetClick}
            />
          ))}

          {/* Render Floating Scores */}
          {floatingTexts.map(ft => (
            <div
              key={ft.id}
              className={`floating-score ${ft.className || ''}`}
              style={{ left: ft.x, top: ft.y }}
            >
              {ft.text}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default ReactionTimePage;