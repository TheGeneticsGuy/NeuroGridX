import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useGameStore } from '../store/game.store';
import axios from 'axios';
import ReactionTimeStatCard from '../components/dashboard/stat-cards/ReactionTimeStatCard';
import InteractiveTarget from '../components/game/InteractiveTarget';
import { type Attempt } from '../config/challenges.config';
import './ReactionTimePage.css';

// --- No changes to constants or interfaces ---
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
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};


const ReactionTimePage: React.FC = () => {
  const {
    gameState, score, hits, misses, timeRemaining, targets, clickAccuracies,
    startGame, handleHit, handleMiss, resetGame, gameSettings // <-- ADD gameSettings
  } = useGameStore();

  const { isAuthenticated, token } = useAuthStore();
  const [userAttempts, setUserAttempts] = useState<Attempt[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // --- NEW: State for game settings ---
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [speed, setSpeed] = useState<'Normal' | 'Medium' | 'Fast'>('Normal');

  // --- No changes to useEffects below, except for saveScore ---
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

  useEffect(() => {
    const saveScore = async () => {
      const ntpm = hits - misses;
      const averageClickAccuracy = clickAccuracies.length > 0 ? clickAccuracies.reduce((a, b) => a + b, 0) / clickAccuracies.length : 0;

      // --- UPDATED: Send game settings to backend ---
      if (gameState === 'Finished' && isAuthenticated && token) {
        try {
          const finalScore = {
            challengeType: 'Reaction Time', score, completionTime: TOTAL_TIME,
            accuracy: hits > 0 ? hits / (hits + misses) : 0, ntpm, averageClickAccuracy,
            settings: {
              mode: gameSettings.isAdvanced ? 'Advanced' : 'Normal',
              speed: gameSettings.isAdvanced ? gameSettings.speed : undefined,
            }
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
  }, [gameState, isAuthenticated, token, score, hits, misses, clickAccuracies, gameSettings]);

  const onGameAreaClick = () => { handleMiss(); };

  const onTargetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    // --- UPDATED: Visual scoring logic now accounts for multipliers ---
    const { gameSettings } = useGameStore.getState();
    const speedMultipliers = { Normal: 1.33, Medium: 1.66, Fast: 2.0 };
    const speedMultiplier = gameSettings.isAdvanced ? speedMultipliers[gameSettings.speed] : 1;

    const rect = e.currentTarget.getBoundingClientRect();
    const radius = rect.width / 2;
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;
    const dist = Math.sqrt(Math.pow(centerX - e.clientX, 2) + Math.pow(centerY - e.clientY, 2));
    const clickAccuracy = Math.max(0, 1 - (dist / radius));

    const linearPoints = clickAccuracy * MAX_POINTS;
    // Calculate base points with multiplier
    const points = Math.round(Math.max(MIN_POINTS, linearPoints) * speedMultiplier);

    const BONUS_THRESHOLD = 0.85;
    // Calculate bonus points with multiplier
    const BONUS_POINTS = Math.round(50 * speedMultiplier);

    const baseText: FloatingText = { id: Date.now(), x: e.clientX, y: e.clientY, text: `+${points}` };
    setFloatingTexts(prev => [...prev, baseText]);

    if (clickAccuracy >= BONUS_THRESHOLD) {
      setTimeout(() => {
        const bonusText: FloatingText = { id: Date.now() + 1, x: e.clientX, y: e.clientY, text: `+${BONUS_POINTS} BONUS!`, className: 'bonus' };
        setFloatingTexts(prev => [...prev, bonusText]);
        setTimeout(() => {
          setFloatingTexts(prev => prev.filter(ft => ft.id !== bonusText.id));
        }, 1000);
      }, 100);
    }

    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== baseText.id));
    }, 800);

    handleHit(e.clientX, e.clientY, e.currentTarget);
  };

  // --- UPDATED: startGameHandler now passes settings ---
  const startGameHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    startGame({ isAdvanced: isAdvancedMode, speed });
  };

  const ntpm = hits - misses;
  const averageClickAccuracy = clickAccuracies.length > 0 ? (clickAccuracies.reduce((a, b) => a + b, 0) / clickAccuracies.length * 100).toFixed(2) : 'N/A';

  return (
    <div className="challenge-page-wrapper">
      <div className="challenge-hud-area">
        {gameState === 'InProgress' && (
          <div className="game-hud">
            <div>Time: {formatTime(timeRemaining)}</div>
            <div>Score: {score}</div>
            <div>NTPM: {ntpm}</div>
          </div>
        )}
      </div>

      <div className="challenge-canvas-area">
        <div className="game-canvas" onClick={onGameAreaClick}>
          {gameState === 'NotStarted' && (
            <div className="game-overlay">
              <h1>Reaction Time Challenge</h1>
              {isAuthenticated && !loadingStats && userAttempts.length > 0 && (
                <div className="stat-card-inline">
                  <h3>Your Stats</h3>
                  <ReactionTimeStatCard attempts={userAttempts} />
                </div>
              )}

              {/* --- NEW: Advanced Mode Settings UI --- */}
              <div className="game-settings">
                <div className="setting-row">
                  <label htmlFor="advanced-toggle">Advanced Mode</label>
                  <label className="theme-toggle" title="Toggle Advanced Mode">
                    <input
                      type="checkbox"
                      id="advanced-toggle"
                      checked={isAdvancedMode}
                      onChange={() => setIsAdvancedMode(!isAdvancedMode)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                {isAdvancedMode && (
                  <div className="setting-row">
                    <label>Target Speed</label>
                    <div className="speed-selector">
                      <button className={speed === 'Normal' ? 'active' : ''} onClick={() => setSpeed('Normal')}>Normal</button>
                      <button className={speed === 'Medium' ? 'active' : ''} onClick={() => setSpeed('Medium')}>Medium</button>
                      <button className={speed === 'Fast' ? 'active' : ''} onClick={() => setSpeed('Fast')}>Fast</button>
                    </div>
                  </div>
                )}
              </div>

              <p>
                {isAdvancedMode
                  ? "Targets will move and bounce off the walls. Score is multiplied by speed!"
                  : `Click as many targets as you can in ${TOTAL_TIME} seconds.`
                }
              </p>
              <p>Points are awarded based on how close you click to the center.</p>
              <button onClick={startGameHandler} className="cta-button">
                Start Game
              </button>
            </div>
          )}

          {/* --- No changes to Finished Overlay or Target Rendering --- */}
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