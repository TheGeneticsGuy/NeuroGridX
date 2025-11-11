import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useGameStore } from '../store/game.store';
import axios from 'axios';
import ReactionTimeStatCard from '../components/dashboard/stat-cards/ReactionTimeStatCard';
import { type Attempt } from '../config/challenges.config';
import './ReactionTimePage.css';

const totalTime = 60; // Fixed game timer, but I can adjust

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const ReactionTimePage: React.FC = () => {
  // State/Actions from game store.
  const {
    gameState, score, hits, misses, timeRemaining, targets, clickAccuracies,
    startGame, handleHit, handleMiss, resetGame
  } = useGameStore();

  // For saving the score, must be authenticated.
  const { isAuthenticated, token } = useAuthStore();
  const [userAttempts, setUserAttempts] = useState<Attempt[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Cleans up game if component isn't mounted
  useEffect(() => {
    return () => {
      resetGame();
    };
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
    // Update the stats on load and when game ends.
    fetchAttempts();
  }, [isAuthenticated, token, gameState]);


  // This "effect" handles saving the score when the game finishes
  useEffect(() => {
    const saveScore = async () => {
      const ntpm = hits - misses;
      const averageClickAccuracy = clickAccuracies.length > 0 ? clickAccuracies.reduce((a, b) => a + b, 0) / clickAccuracies.length : 0;

      if (gameState === 'Finished' && isAuthenticated && token) {

        try {
          const finalScore = {
            challengeType: 'Reaction Time', score, completionTime: totalTime,
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
  const onTargetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
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
    <div className="game-container">
      <div className="game-canvas" onClick={onGameAreaClick}>

        {/* The HUD is now correctly placed INSIDE the canvas again */}
        {gameState === 'InProgress' && (
          <div className="game-hud">
            <div>Time: {formatTime(timeRemaining)}</div>
            <div>Score: {score}</div>
            <div>NTPM: {ntpm}</div>
          </div>
        )}

        {gameState === 'NotStarted' && (
          <div className="game-overlay">
            {/* ... overlay content ... */}
            <h1>Reaction Time Challenge</h1>
            {isAuthenticated && !loadingStats && userAttempts.length > 0 && (
              <div className="stat-card-inline">
                <h3>Your Stats</h3>
                <ReactionTimeStatCard attempts={userAttempts} />
              </div>
            )}
            <p>Click as many targets as you can in {totalTime} seconds.</p>
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
              <button onClick={startGameHandler} className="cta-button">Play Again</button>
            </div>
          )}

        {gameState === 'InProgress' && targets.map(target => (
          <div
            key={target.id}
            className="target"
            style={{
              left: `${target.x}px`, top: `${target.y}px`,
              width: `${target.size}px`, height: `${target.size}px`,
            }}
            onClick={onTargetClick}
          />
        ))}
      </div>
    </div>
  );

};

export default ReactionTimePage;