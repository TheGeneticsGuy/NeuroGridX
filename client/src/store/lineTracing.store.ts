import { create } from 'zustand';

const GameState = {
  NotStarted: 'NotStarted',
  InProgress: 'InProgress',
  Finished: 'Finished', // Successfully reached the end
  Failed: 'Failed',     // Went off the line
} as const;
type GameState = typeof GameState[keyof typeof GameState];

export interface Point {
  x: number;
  y: number;
}

const AUTOFAILTIME = 120;

interface LineTracingStore {
  gameState: GameState;
  score: number;
  timeElapsed: number;
  progress: number; // 0 to 100%
  pathPoints: Point[]; // waypoints possible - leaving placeholder in case I add them
  lineWidth: number;
  penalties: number;
  isOffPath: boolean;
  graceTimeRemaining: number;

  // Actions
  generatePath: (width: number, height: number, existingPath?: Point[]) => void;
  startGame: () => void;
  failGame: () => void;
  completeGame: () => void;
  updateProgress: (percent: number) => void;
  resetGame: () => void;

  _timerInterval: number | null;
}

export const useLineTracingStore = create<LineTracingStore>((set, get) => ({
  gameState: GameState.NotStarted,
  score: 0,
  timeElapsed: 0,
  progress: 0,
  pathPoints: [],
  lineWidth: 40, // Width of the path in pixels
  _timerInterval: null,
  penalties: 0,
  isOffPath: false,
  graceTimeRemaining: 2.0,

  generatePath: (width, height, existingPath) => {
    // If "Retry" is clicked, pass the existing path back in, don't gen a new one
    if (existingPath) {
      set({ pathPoints: existingPath });
      return;
    }

    // Generate a new random path
    // Very simple algorithm: Start the Left side of screen (like reading), End Right, randomize the Y positions
    const points: Point[] = [];
    const numPoints = 6; // Number of curves. I might change this...
    const segmentWidth = width / (numPoints - 1);
    const padding = 50;

    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: (i * segmentWidth) + (i === 0 ? padding : i === numPoints - 1 ? -padding : 0), // Start/End padding
        y: Math.random() * (height - 200) + 100 // The vertical bounds
      });
    }
    set({ pathPoints: points });
  },

  startGame: () => {
    if (get()._timerInterval) clearInterval(get()._timerInterval as number);

    set({
      gameState: GameState.InProgress,
      score: 0,
      timeElapsed: 0,
      progress: 0,
      penalties: 0,
      isOffPath: false,
      graceTimeRemaining: 2.0
    });

    const startTime = Date.now();
    const interval = window.setInterval(() => {
      const state = get();

      // Main Game Timer
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      // Grace Period Logic
      let newGraceTime = state.graceTimeRemaining;

      if (state.isOffPath) {
          // If off path, drain grace time
          newGraceTime -= 0.1; // 100ms decrement

          if (newGraceTime <= 0) {
              get().failGame();
              return;
          }
      } else {
          // If on path, regenerate grace time? Or just reset?
          // Let's just reset it to 2s instantly when they return for simplicity
          newGraceTime = 2.0;
      }

      set({ timeElapsed: elapsed, graceTimeRemaining: newGraceTime });

      // Auto-fail (2 mins)
      if (elapsed >= 120) { /* ... fail ... */ }
    }, 100);

    set({ _timerInterval: interval });
  },

   goOffPath: () => {
      const { isOffPath, penalties } = get();
      // CRITICAL - It was counting penalty returning to path. Only count if going from the path to off
      if (!isOffPath) {
          set({
              isOffPath: true,
              penalties: penalties + 1 // Increment penalty count
          });
      }
  },

  // Need to reset the grace time and set the off path back to false
  returnToPath: () => {
      const { isOffPath } = get();
      if (isOffPath) {
          set({ isOffPath: false, graceTimeRemaining: 2.0 });
      }
  },

  updateProgress: (newProgress) => {
    set({ progress: newProgress });
  },

  failGame: () => {
    if (get()._timerInterval) clearInterval(get()._timerInterval as number);
    // Score is 0 on failure, but progress is saved
    set({ gameState: GameState.Failed, score: 0, _timerInterval: null });
  },

  completeGame: () => {
    if (get()._timerInterval) clearInterval(get()._timerInterval as number);
    const { timeElapsed, penalties } = get();
    // Base score 1000.
    // Maybe bonus? = (AUTOFAILTIME - timeElapsed) * 10. Faster time = way more points.
    let score = Math.round(1000 + ((120 - timeElapsed) * 50));
    score -= (penalties * 500);
    score = Math.max(0, score); // Negative Scores are no fun so setting to zero

    set({ gameState: GameState.Finished, score, progress: 100, _timerInterval: null });
  },

  resetGame: () => {
    if (get()._timerInterval) clearInterval(get()._timerInterval as number);
    set({
      gameState: GameState.NotStarted,
      score: 0,
      timeElapsed: 0,
      progress: 0,
      pathPoints: [],
      _timerInterval: null,
    });
  }
}));