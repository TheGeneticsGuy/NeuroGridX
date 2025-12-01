import { create } from 'zustand';

// PENDING NOTES AND IDEAS:
// PENALTYU - Determine better scoring mechanism... I initially removed 20 on a miss, but I am realizing that
//              removing points is no fun. It should just reward total accomplished.

const TOTAL_TIME = 60;
const MAX_TARGET_SIZE = 120;
const MIN_TARGET_SIZE = 40;

const GameState = {
  NotStarted: 'NotStarted',
  InProgress: 'InProgress',
  Finished: 'Finished',
} as const;
type GameState = typeof GameState[keyof typeof GameState];

type Speed = 'Normal' | 'Medium' | 'Fast';
interface GameSettings {
  isAdvanced: boolean;
  speed: Speed;
}

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  vx: number; // Velocity X
  vy: number; // Velocity Y
}

interface GameStateStore {
  gameState: GameState;
  score: number;
  hits: number;
  misses: number;
  timeRemaining: number;
  targets: Target[];
  clickAccuracies: number[];
  gameSettings: GameSettings;
  consecutiveMisses: number;

  startGame: (settings: GameSettings) => void;
  handleHit: (clickX: number, clickY: number, targetElement: HTMLDivElement) => void;
  handleMiss: () => void;
  resetGame: () => void;
  _timerInterval: number | null;
  _animationFrameId: number | null;
  _generateTarget: () => void;
  _gameLoop: () => void;
  _endGame: () => void;
}

const SPEED_MULTIPLIERS = { Normal: 1.33, Medium: 1.66, Fast: 2.0 }; // I think I'll match the scoring to the speed, so 1.33x points for speed?
const BASE_SPEED = 0.5;

export const useGameStore = create<GameStateStore>((set, get) => ({
  gameState: GameState.NotStarted,
  score: 0,
  hits: 0,
  misses: 0,
  timeRemaining: TOTAL_TIME,
  targets: [],
  clickAccuracies: [],
  gameSettings: { isAdvanced: false, speed: 'Normal' },
  _timerInterval: null,
  _animationFrameId: null,
  consecutiveMisses: 0,

  startGame: (settings) => {
    if (get()._timerInterval) clearInterval(get()._timerInterval!);
    if (get()._animationFrameId) cancelAnimationFrame(get()._animationFrameId!);

    set({
      gameState: GameState.InProgress,
      score: 0,
      hits: 0,
      misses: 0,
      timeRemaining: TOTAL_TIME,
      clickAccuracies: [],
      gameSettings: settings,
      consecutiveMisses: 0,
    });

    get()._generateTarget();

    const timer = setInterval(() => {
      if (get().timeRemaining <= 1) {
        get()._endGame();
      } else {
        set((state) => ({ timeRemaining: state.timeRemaining - 1 }));
      }
    }, 1000);
    set({ _timerInterval: timer });

    if (settings.isAdvanced) {
      get()._gameLoop();
    }
  },

  handleHit: (clickX, clickY, targetElement) => {
    if (get().gameState !== GameState.InProgress) return;

    const { gameSettings } = get();
    const speedMultiplier = gameSettings.isAdvanced ? SPEED_MULTIPLIERS[gameSettings.speed] : 1;

    const rect = targetElement.getBoundingClientRect();
    const radius = rect.width / 2;
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;

    const distance = Math.sqrt(Math.pow(centerX - clickX, 2) + Math.pow(centerY - clickY, 2));

    let pointsEarned = 0;
    let clickAccuracy = 0;
    const MAX_POINTS = 100;
    const MIN_POINTS_ON_HIT = 25;
    const BONUS_ON_ACCURACY = 50;
    const PERCENT_MIN_BONUS = 0.75;

    if (distance <= radius) {
      clickAccuracy = 1 - (distance / radius);

      let linearPoints = clickAccuracy * MAX_POINTS;

      const basePointsWithMultiplier = Math.max(MIN_POINTS_ON_HIT, linearPoints) * speedMultiplier;
      pointsEarned = Math.round(basePointsWithMultiplier);

      if (clickAccuracy >= PERCENT_MIN_BONUS) {
        pointsEarned += Math.round(BONUS_ON_ACCURACY * speedMultiplier);
      }

      set((state) => ({
        hits: state.hits + 1,
        score: state.score + pointsEarned,
        clickAccuracies: [...state.clickAccuracies, clickAccuracy],
        consecutiveMisses: 0,
      }));

      get()._generateTarget();
    }
  },

  handleMiss: () => {
    if (get().gameState !== GameState.InProgress) return;

    const MISS_PENALTY = 25;
    const MAX_CONSECUTIVE_MISSES = 5;
    const currentMisses = get().consecutiveMisses + 1;

    const stateUpdate: Partial<GameStateStore> = {
      misses: get().misses + 1,
      score: get().score - MISS_PENALTY,
      consecutiveMisses: currentMisses,
    };

    // MERCY RULE!!! 5 misses in a row, generate new target!
    if (currentMisses >= MAX_CONSECUTIVE_MISSES) {
      stateUpdate.consecutiveMisses = 0;
      get()._generateTarget();
    }

    set(stateUpdate);
  },

  resetGame: () => {
    if (get()._timerInterval) clearInterval(get()._timerInterval!);
    if (get()._animationFrameId) cancelAnimationFrame(get()._animationFrameId!);
    set({
      gameState: GameState.NotStarted,
      score: 0,
      hits: 0,
      misses: 0,
      timeRemaining: TOTAL_TIME,
      targets: [],
      clickAccuracies: [],
      _timerInterval: null,
      _animationFrameId: null,
    });
  },

  _generateTarget: () => {
    const canvas = document.querySelector('.game-canvas');
    if (!canvas) {
      console.error("Game canvas not found!");
      return;
    }

    const { gameSettings } = get();
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;
    const HUD_OFFSET_Y = 0;

    const size = Math.random() * MAX_TARGET_SIZE + MIN_TARGET_SIZE;
    const radius = size / 2;

    const effectiveWidth = canvasWidth - size;
    const effectiveHeight = canvasHeight - size - HUD_OFFSET_Y;

    let initVx = 0;
    let initVy = 0;

    if (gameSettings.isAdvanced) {
      const speedValue = BASE_SPEED * (Object.keys(SPEED_MULTIPLIERS).indexOf(gameSettings.speed) + 1.5);
      const angle = Math.random() * 2 * Math.PI;
      initVx = Math.cos(angle) * speedValue;
      initVy = Math.sin(angle) * speedValue;
    }

    const newTarget: Target = {
      id: Date.now(),
      x: Math.random() * effectiveWidth + radius,
      y: (Math.random() * effectiveHeight + radius) + HUD_OFFSET_Y,
      size: size,
      vx: initVx,
      vy: initVy,
    };

    set({ targets: [newTarget] });
  },

  _gameLoop: () => {
    const { targets, gameState } = get();
    if (gameState !== GameState.InProgress) return;

    const canvas = document.querySelector('.game-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const updatedTargets = targets.map(target => {
      let newX = target.x;
      let newY = target.y;
      let newVx = target.vx;
      let newVy = target.vy;
      const radius = target.size / 2;

      newX += newVx;
      newY += newVy;

      // Bounce off walls
      if (newX + radius >= rect.width) {
        newX = rect.width - radius;
        newVx = -newVx;
      } else if (newX - radius <= 0) {
        newX = radius;
        newVx = -newVx;
      }

      if (newY + radius >= rect.height) {
        newY = rect.height - radius;
        newVy = -newVy;
      } else if (newY - radius <= 0) {
        newY = radius;
        newVy = -newVy;
      }

      return { ...target, x: newX, y: newY, vx: newVx, vy: newVy };
    });

    set({ targets: updatedTargets });

    const frameId = requestAnimationFrame(get()._gameLoop);
    set({ _animationFrameId: frameId });
  },

  _endGame: () => {
    if (get()._timerInterval) clearInterval(get()._timerInterval!);
    if (get()._animationFrameId) cancelAnimationFrame(get()._animationFrameId!);
    set({
      gameState: GameState.Finished,
      _timerInterval: null,
      _animationFrameId: null,
      targets: []
    });
  },
}));