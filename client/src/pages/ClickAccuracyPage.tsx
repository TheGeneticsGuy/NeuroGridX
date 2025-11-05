import React, { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useGameStore } from '../store/game.store';
import axios from 'axios';
import './ClickAccuracyPage.css';

const totalTime = 60; // Fixed countdown timer of 60 seconds

// For the countdown
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / totalTime).toString().padStart(2, '0');
  const secs = (seconds % totalTime).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const ClickAccuracyPage: React.FC = () => {
  // State and actions from our new game store
  const {
    gameState, score, hits, misses, timeRemaining, targets, clickAccuracies,
    startGame, handleHit, handleMiss, resetGame
  } = useGameStore();

  // Auth info for saving the score
  const { isAuthenticated, token } = useAuthStore();

  // Cleans up game if component is unmounted, like a different part of site.
  useEffect(() => {
    return () => {
      resetGame();
    };
  }, [resetGame]);

  // This effect handles saving the score when the game finishes
  useEffect(() => {
    const saveScore = async () => {
      // Calculate final metrics
      const ntpm = hits - misses;
      const averageClickAccuracy = clickAccuracies.length > 0
        ? clickAccuracies.reduce((a, b) => a + b, 0) / clickAccuracies.length
        : 0;

      if (gameState === 'Finished' && isAuthenticated && token) {
        try {
          const finalScore = {
            challengeType: 'Reaction Time',
            score: score,
            completionTime: totalTime,
            accuracy: hits > 0 ? hits / (hits + misses) : 0,
            ntpm: ntpm,
            averageClickAccuracy: averageClickAccuracy,
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

  // The main click handler for the game area (a miss)
  const onGameAreaClick = () => {
    handleMiss();
  };

  // Circle click handler
  const onTargetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevents the click from creeping up to the game area
    handleHit(e.clientX, e.clientY, e.currentTarget);
  };

  // Calculate stats for end of game display
  const ntpm = hits - misses;
  const averageClickAccuracy = clickAccuracies.length > 0
    ? (clickAccuracies.reduce((a, b) => a + b, 0) / clickAccuracies.length * 100).toFixed(2)
    : 'N/A';

  return (
    <div className="game-container" onClick={onGameAreaClick}>
      {gameState === 'NotStarted' && (
        <div className="game-overlay">
          <h1>Reaction Time Challenge</h1>
          <p>Click as many targets as you can in {totalTime} seconds.</p>
          <p>Points are awarded based on how close you click to the center.</p>
          <button
            onClick={(e) => {
              e.stopPropagation(); // I was having challenge where negative score was always at start due to first click
              startGame();
            }}
            className="cta-button"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === 'InProgress' && (
        <div className="game-hud">
          <div>Time: {formatTime(timeRemaining)}</div>
          <div>Score: {score}</div>
          <div>NTPM: {ntpm}</div>
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
          <button onClick={startGame} className="cta-button">Play Again</button>
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
  );
};

export default ClickAccuracyPage;