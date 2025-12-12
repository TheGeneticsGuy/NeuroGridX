import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useGameStore } from '../store/game.store';
import axios from 'axios';
import ReactionTimeStatCard from '../components/dashboard/stat-cards/ReactionTimeStatCard';
import InteractiveTarget from '../components/game/InteractiveTarget';
import { type Attempt } from '../types/challenge.types';
import GameRulesSidebar from '../components/game/GameRulesSidebar';
import { useSocketStore } from '../store/socket.store';
import './ReactionTimePage.css';
import { useUIStore } from '../store/ui.store';

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
    startGame, handleHit, handleMiss, resetGame, gameSettings
  } = useGameStore();

  const { isAuthenticated, token } = useAuthStore();
  const [userAttempts, setUserAttempts] = useState<Attempt[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const { gameSettings: uiGameSettings, setGameSettings } = useUIStore();
  const { isAdvanced: isAdvancedMode, speed } = uiGameSettings;
  const { emitGameUpdate, emitGameEnd } = useSocketStore();

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

      if (gameState === 'Finished' && isAuthenticated && token) {
        try {

          const finalScore = {
            challengeType: 'Reaction Time',
            score,
            completionTime: TOTAL_TIME,
            accuracy: hits > 0 ? hits / (hits + misses) : 0,
            ntpm,
            averageClickAccuracy,
            penalties: misses,
            settings: {
              mode: gameSettings.isAdvanced ? 'Advanced' : 'Normal',
              speed: gameSettings.isAdvanced ? gameSettings.speed : undefined,
            }
          };

          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/attempts`, finalScore, {
            headers: { Authorization: `Bearer ${token}` },
          });

        } catch (error: any) {
          console.error("Failed to save score:", error);
        if (error.response) {
          // More detailed as this was failing
          console.error("Server Error Details:", error.response.data);
        }
      }
      }
    };

    if (gameState === 'Finished') {
      saveScore();
    }
  }, [gameState, isAuthenticated, token, score, hits, misses, clickAccuracies, gameSettings]);

  // Telemetry Effect (using websocket)
  useEffect(() => {
    let interval: number;

    if (gameState === 'InProgress') {
      interval = window.setInterval(() => {
        const state = useGameStore.getState();
        // Send snapshot of current state
        emitGameUpdate({
            type: 'Reaction Time',
            score: state.score,
            timeRemaining: state.timeRemaining,
            hits: state.hits,
            misses: state.misses,
            mode: gameSettings.isAdvanced ? 'Advanced' : 'Normal',
            speed: gameSettings.isAdvanced ? gameSettings.speed : '-'
        });
      }, 200); // 5 times a second (200ms)
    } else if (gameState === 'Finished' || gameState === 'NotStarted') {
        // When game stops, tell server
        emitGameEnd();
    }

    return () => clearInterval(interval);
  }, [gameState, emitGameUpdate, emitGameEnd]);

  // Need to filter advanced vs normal mode on the stats
  const filteredAttempts = useMemo(() => {
    return userAttempts.filter(attempt => {
      const attemptMode = attempt.settings?.mode || 'Normal';
      const targetMode = isAdvancedMode ? 'Advanced' : 'Normal';
      return attemptMode === targetMode;
    });
  }, [userAttempts, isAdvancedMode]);

  // For the miss text
  const onGameAreaMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {

    if (useGameStore.getState().gameState !== 'InProgress') return; //  Need to NOT register score if the game isn't running.

    const { gameSettings } = useGameStore.getState();
    const speedMultipliers = { Normal: 1.33, Medium: 1.66, Fast: 2.0 };
    const speedMultiplier = gameSettings.isAdvanced ? speedMultipliers[gameSettings.speed] : 1;
    const MISS_PENALTY = Math.round(25 * speedMultiplier);              // The negative points are also worse when faster. Upping the challenge!
    const isMercySkip = useGameStore.getState().consecutiveMisses >= 4; // Check for 4 becakse this click will be the 5th

    const penaltyText: FloatingText = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      text: `-${MISS_PENALTY}`,
      className: 'penalty',
    };
    setFloatingTexts(prev => [...prev, penaltyText]);

    // Clear it after animation, like other text
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== penaltyText.id));
    }, 800);

    if (isMercySkip) {
        // Mercy text!!
        const mercyText: FloatingText = {
            id: Date.now() + 10,
            x: e.clientX,
            y: e.clientY - 30,
            text: "SKIP!",
            className: "bonus",
        };
        setFloatingTexts(prev => [...prev, mercyText]);
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(ft => ft.id !== mercyText.id));
        }, 1000);
    }

    handleMiss();
  };

  const onTargetMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

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

    const BONUS_THRESHOLD = 0.75;
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
        <div className="game-canvas" onMouseDown={onGameAreaMouseDown}>
          {gameState === 'NotStarted' && (
            <div className="game-overlay">
              <h1>Reaction Time Challenge</h1>
              {isAuthenticated && !loadingStats && userAttempts.length > 0 && (
                <div className="stat-card-inline">
                  <h3>Your Stats ({isAdvancedMode ? 'Advanced' : 'Normal'})</h3>
                  <ReactionTimeStatCard attempts={filteredAttempts} />
                </div>
              )}

              <div className="game-settings">
                <div className="setting-row">
                  <label htmlFor="advanced-toggle">Advanced Mode</label>
                  <label className="theme-toggle" title="Toggle Advanced Mode">
                    <input
                      type="checkbox"
                      id="advanced-toggle"
                      checked={isAdvancedMode}
                      onChange={() => setGameSettings({ isAdvanced: !isAdvancedMode })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                {isAdvancedMode && (
                  <div className="setting-row">
                    <label>Target Speed</label>
                    <div className="speed-selector">
                      <button className={speed === 'Normal' ? 'active' : ''} onClick={() => setGameSettings({ speed: 'Normal' })}>Normal</button>
                      <button className={speed === 'Medium' ? 'active' : ''} onClick={() => setGameSettings({ speed: 'Medium' })}>Medium</button>
                      <button className={speed === 'Fast' ? 'active' : ''} onClick={() => setGameSettings({ speed: 'Fast' })}>Fast</button>
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

          {gameState === 'Finished' && (
            <div className="game-overlay">
              <h1>Time's Up!</h1>
              <p>Final Score: {score}</p>
              <p>Total Hits: {hits}</p>
              <p>Total Misses: {misses}</p>
              <p>Net Targets Per Minute (NTPM): {ntpm}</p>
              <p>Average Click Accuracy to Center: {averageClickAccuracy}%</p>
              {isAuthenticated ? <p>Your score has been saved.</p> : <p>Login to save your scores!</p>}

              <div className="game-settings">
                <div className="setting-row">
                  <label htmlFor="advanced-toggle">Advanced Mode</label>
                  <label className="theme-toggle" title="Toggle Advanced Mode">
                    <input
                      type="checkbox"
                      id="advanced-toggle"
                      checked={isAdvancedMode}
                      onChange={() => setGameSettings({ isAdvanced: !isAdvancedMode })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                {isAdvancedMode && (
                  <div className="setting-row">
                    <label>Target Speed</label>
                    <div className="speed-selector">
                      <button className={speed === 'Normal' ? 'active' : ''} onClick={() => setGameSettings({ speed: 'Normal' })}>Normal</button>
                      <button className={speed === 'Medium' ? 'active' : ''} onClick={() => setGameSettings({ speed: 'Medium' })}>Medium</button>
                      <button className={speed === 'Fast' ? 'active' : ''} onClick={() => setGameSettings({ speed: 'Fast' })}>Fast</button>
                    </div>
                  </div>
                )}
              </div>

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
              onMouseDown={onTargetMouseDown}
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

      <GameRulesSidebar mode="Reaction Time" />
    </div>
  );
};

export default ReactionTimePage;