import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/auth.store';
import axios from 'axios';
import './ClickAccuracyPage.css';

// PENDING NOTES AND IDEAS:
// RANDOM SIZE - Add option to make the sizes random and placement random, or a fixed event.
//          The issue is due to randomness, someone could get an easier placement... not sure how I want to approach yet.
//          THOUGHTS - Fixed amount of sizes, but placement is random, and order, is random, and maybe placement will always be equal distance away
//          but round position on the circle.
// PENALTYU - Determine better scoring mechanism... I initially minused 20 on a miss, but I am realizing that
//              removing points is no fun. It should just reward total accomplished.
// USEFFECT - THOUGHTS - Only save if your best score.


// For determining the shape of a target
interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
}

// Enum for the different game states
const GameState = {
  NotStarted: 'NotStarted',
  InProgress: 'InProgress',
  Finished: 'Finished',
} as const;

type GameState = typeof GameState[keyof typeof GameState];

const ClickAccuracyPage: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.NotStarted);
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);

  // Get user info from Zustand store
  const { isAuthenticated, token } = useAuthStore();
  const TOTAL_TARGETS = 15;

  // Method to generate random position of new target... THIS WILL BE TWEAKED A LOT
  const generateTarget = useCallback(() => {
    const size = Math.random() * 130 + 20; // Random size between 20 and 150px - SHOULD I DO RANDOM?
    const newTarget: Target = {
      id: Date.now(),
      x: Math.random() * (window.innerWidth - size * 2) + size,
      y: Math.random() * (window.innerHeight - size * 2 - 80) + size + 80, // This ensure header is avoided.
      size: size,
    };
    setTargets([newTarget]);
  }, []);

  // Reset game data on start
  const startGame = () => {
    setScore(0);
    setHits(0);
    setMisses(0);
    setTimeTaken(0);
    setGameState(GameState.InProgress);
    setStartTime(Date.now());
    generateTarget();
  };

  const handleHit = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevents the click from registering on the game area (a miss)

    if (gameState !== GameState.InProgress) return;

    setScore(prev => prev + 100);
    setHits(prev => prev + 1);

    if (hits + 1 >= TOTAL_TARGETS) {
      setGameState(GameState.Finished);
      setStartTime(null);
      if(startTime) {
        setTimeTaken((Date.now() - startTime) / 1000);
      }
    } else {
      generateTarget();
    }
  };

  const handleMiss = () => {
    if (gameState !== GameState.InProgress) return;
    setMisses(prev => prev + 1);
    setScore(prev => prev - 20); // Penalty for missing
  };

  // This useEffect hook runs when game finishes and result is saved.
  useEffect(() => {
    const saveScore = async () => {
      if (gameState === GameState.Finished && isAuthenticated && token) {
        try {
          const finalScore = {
            challengeType: 'Click Accuracy',
            score: score,
            completionTime: timeTaken,
            accuracy: hits / (hits + misses),
          };

          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/attempts`, finalScore, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Score saved successfully!");
        } catch (error) {
          console.error("Failed to save score:", error);
        }
      }
    };

    saveScore();
  }, [gameState, isAuthenticated, token, score, timeTaken, hits, misses]);

  return (
    <div className="game-container" onClick={handleMiss}>
      {gameState === GameState.NotStarted && (
        <div className="game-overlay">
          <h1>Click Accuracy Challenge</h1>
          <p>Click {TOTAL_TARGETS} targets as quickly and accurately as possible.</p>
          <button onClick={startGame} className="cta-button">Start Game</button>
        </div>
      )}

      {gameState === GameState.InProgress && (
        <div className="game-hud">
          <div>Score: {score}</div>
          <div>Hits: {hits}/{TOTAL_TARGETS}</div>
          <div>Misses: {misses}</div>
        </div>
      )}

      {gameState === GameState.Finished && (
         <div className="game-overlay">
          <h1>Challenge Complete!</h1>
          <p>Final Score: {score}</p>
          <p>Time Taken: {timeTaken.toFixed(2)} seconds</p>
          <p>Accuracy: {((hits / (hits + misses)) * 100).toFixed(2)}%</p>
          {isAuthenticated && <p>Your score has been saved to your dashboard.</p>}
          {!isAuthenticated && <p>Login to save your scores and track your progress!</p>}
          <button onClick={startGame} className="cta-button">Play Again</button>
        </div>
      )}

      {gameState === GameState.InProgress && targets.map(target => (
        <div
          key={target.id}
          className="target"
          style={{
            left: `${target.x}px`,
            top: `${target.y}px`,
            width: `${target.size}px`,
            height: `${target.size}px`,
          }}
          onClick={handleHit}
        />
      ))}
    </div>
  );
};

export default ClickAccuracyPage;