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
    });

    const startTime = Date.now();
    const interval = window.setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      set({ timeElapsed: elapsed });

      // Auto-fail after 2 minutes (120 seconds for now)
      if (elapsed >= AUTOFAILTIME) {
        clearInterval(interval);
        set({ gameState: GameState.NotStarted, _timerInterval: null }); // Reset without saving
      }
    }, 100); // Update every 100ms

    set({ _timerInterval: interval });
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

    // Base score 1000.
    // Maybe bonus? = (AUTOFAILTIME - timeElapsed) * 10. Faster time = way more points.
    const time = get().timeElapsed;
    const score = Math.round(1000 + ((AUTOFAILTIME - time) * 50));

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