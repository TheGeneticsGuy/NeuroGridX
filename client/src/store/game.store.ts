import { create } from 'zustand';


// PENDING NOTES AND IDEAS:
// PENALTYU - Determine better scoring mechanism... I initially removed 20 on a miss, but I am realizing that
//              removing points is no fun. It should just reward total accomplished.
// ADD An Advanced challenge mode where the object is moving around... and you can set it to 4 differnt speeds. Normal Med Fast Ultra Fast
// Add horizontal and vertical lines with intersecting at the mouse cursor, with a % accuracy number over cursor on the click.

const TOTAL_TIME = 60;
const MAX_TARGET_SIZE = 120;

// For some reason I couldn't get enum to work right...
const GameState = {
  NotStarted: 'NotStarted',
  InProgress: 'InProgress',
  Finished: 'Finished',
} as const;
type GameState = typeof GameState[keyof typeof GameState];

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface GameStateStore {
  gameState: GameState;
  score: number;
  hits: number;
  misses: number;
  timeRemaining: number;
  targets: Target[];
  clickAccuracies: number[]; // Array to store accuracy of each hit (0 to 1)

  // Actions
  startGame: () => void;
  handleHit: (clickX: number, clickY: number, targetElement: HTMLDivElement) => void;
  handleMiss: () => void;
  resetGame: () => void;
   // Internal timer
   _timerInterval: number | null;
  _generateTarget: () => void;
}

export const useGameStore = create<GameStateStore>((set, get) => ({
  gameState: GameState.NotStarted,
  score: 0,
  hits: 0,
  misses: 0,
  timeRemaining: TOTAL_TIME,
  targets: [],
  clickAccuracies: [],
  _timerInterval: null,

  startGame: () => {
    // Clear before starting new.
    if (get()._timerInterval) {
      clearInterval(get()._timerInterval as number);
    }

    set({
      gameState: GameState.InProgress,
      score: 0,
      hits: 0,
      misses: 0,
      timeRemaining: TOTAL_TIME,
      clickAccuracies: [],
    });

    get()._generateTarget(); // Generate the first target

    const interval = setInterval(() => {
      set((state) => ({ timeRemaining: state.timeRemaining - 1 }));
      if (get().timeRemaining <= 0) {
        clearInterval(interval);
        set({ gameState: GameState.Finished, _timerInterval: null, targets: [] });
      }
    }, 1000);
    set({ _timerInterval: interval });
  },

  handleHit: (clickX, clickY, targetElement) => {
    if (get().gameState !== GameState.InProgress) return;

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

    if (distance <= radius) { // Valid hit
      // Calculate accuracy as a percentage (1.0 = center, 0.0 = edge)
      clickAccuracy = 1 - (distance / radius);

      // Linear scale from 100 down to 0
      let linearPoints = clickAccuracy * MAX_POINTS;
      if (linearPoints >= (MAX_POINTS * .90)) { // 90% of greater gets full credit
        linearPoints += BONUS_ON_ACCURACY;
      }

      // Points awarded are never less than the minimum
      pointsEarned = Math.max(MIN_POINTS_ON_HIT, linearPoints);

      // Round to whole number - just cleaner
      pointsEarned = Math.round(pointsEarned);

      set((state) => ({
        hits: state.hits + 1,
        score: state.score + pointsEarned,
        clickAccuracies: [...state.clickAccuracies, clickAccuracy],
      }));

      get()._generateTarget();
    }
  },

  handleMiss: () => {
    if (get().gameState !== GameState.InProgress) return;

    const MISS_PENALTY = 25; // 25 point penalty on bad clicks - might make worse...

    set((state) => ({
      misses: state.misses + 1,
      score: state.score - MISS_PENALTY,
    }));
  },

  resetGame: () => {
    if (get()._timerInterval) {
      clearInterval(get()._timerInterval as number);
    }
    set({
      gameState: GameState.NotStarted,
      score: 0,
      hits: 0,
      misses: 0,
      timeRemaining: TOTAL_TIME,
      targets: [],
      clickAccuracies: [],
      _timerInterval: null,
    });
  },

  // "Private" helper function
  _generateTarget: () => {
    const size = Math.random() * MAX_TARGET_SIZE + 30;
    const newTarget: Target = {
      id: Date.now(),
      x: Math.random() * (window.innerWidth - size * 2) + size,
      y: Math.random() * (window.innerHeight - size * 2 - 80) + size + 80,
      size: size,
    };
    set({ targets: [newTarget] });
  },
}));