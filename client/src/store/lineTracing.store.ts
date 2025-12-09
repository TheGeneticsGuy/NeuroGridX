import { create } from 'zustand';

const GameState = {
  NotStarted: 'NotStarted',
  InProgress: 'InProgress',
  Finished: 'Finished',
  Failed: 'Failed',
} as const;
type GameState = typeof GameState[keyof typeof GameState];

export interface Point {
  x: number;
  y: number;
}

const TOTAL_TIME = 30;
const BASE_WIDTH = 50;

interface LineTracingStore {
  gameState: GameState;
  score: number;
  timeRemaining: number;
  progress: number;
  pathPoints: Point[];
  lineWidth: number;
  penalties: number;
  isOffPath: boolean;
  graceTimeRemaining: number;
  failReason: string | null;

  // Anti-Cheat State to Prevent mouse jumping on exit
  lastValidPosition: Point | null;
  exitProgress: number;

  // Actions
  generatePath: (width: number, height: number, existingPath?: Point[]) => void;
  startGame: () => void;
  failGame: (reason?: string) => void;
  completeGame: () => void;
  updateProgress: (percent: number) => void;
  updateLastValidPosition: (p: Point, prog: number) => void;
  resetGame: () => void;
  goOffPath: () => void;
  returnToPath: () => void;

  _timerInterval: number | null;
}

export const useLineTracingStore = create<LineTracingStore>((set, get) => ({
  gameState: GameState.NotStarted,
  score: 0,
  timeRemaining: TOTAL_TIME, // Start at 30
  progress: 0,
  pathPoints: [],
  lineWidth: BASE_WIDTH,
  _timerInterval: null,
  penalties: 0,
  isOffPath: false,
  graceTimeRemaining: 2.0,
  failReason: null,
  lastValidPosition: null,
  exitProgress: 0,

  generatePath: (width, height, existingPath) => {
    if (existingPath) {
      set({ pathPoints: existingPath });
      return;
    }

    const points: Point[] = [];
    const numPoints = 6;
    const paddingX = 50;

    const segmentWidth = (width - (paddingX * 2)) / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: paddingX + (i * segmentWidth),
        y: Math.random() * (height - 200) + 100
      });
    }
    set({ pathPoints: points });
  },

  startGame: () => {
    if (get()._timerInterval) clearInterval(get()._timerInterval as number);

    set({
      gameState: GameState.InProgress,
      score: 0,
      timeRemaining: TOTAL_TIME, // Reset to 30
      progress: 0,
      penalties: 0,
      isOffPath: false,
      graceTimeRemaining: 2.0,
      failReason: null,
      lastValidPosition: null,
      exitProgress: 0
    });

    const interval = window.setInterval(() => {
      const state = get();

      // TIMER LOGIC (Count Down)
      let newTime = state.timeRemaining - 0.1;

      let newGraceTime = state.graceTimeRemaining;

      if (state.isOffPath) {
          newGraceTime -= 0.1;
          if (newGraceTime <= 0) {
              get().failGame("Time out! You stayed off the path too long.");
              return;
          }
      } else {
          newGraceTime = 2.0;
      }

      set({ timeRemaining: newTime, graceTimeRemaining: newGraceTime });

      // Auto-fail at 0
      if (newTime <= 0) {
        get().failGame("Time limit exceeded.");
      }
    }, 100);

    set({ _timerInterval: interval });
  },

  goOffPath: () => {
    const { isOffPath, penalties } = get();
    if (!isOffPath) {
        set({
            isOffPath: true,
            penalties: penalties + 1
        });
    }
  },

  returnToPath: () => {
    const { isOffPath } = get();
    if (isOffPath) {
        set({ isOffPath: false, graceTimeRemaining: 2.0 });
    }
  },

  updateProgress: (newProgress) => {
    set({ progress: newProgress });
  },

  updateLastValidPosition: (point, prog) => {
    set({ lastValidPosition: point, exitProgress: prog });
  },

  failGame: (reason = "Failed") => {
    if (get()._timerInterval) clearInterval(get()._timerInterval as number);
    set({ gameState: GameState.Failed, score: 0, _timerInterval: null, failReason: reason });
  },

  completeGame: () => {
    if (get()._timerInterval) clearInterval(get()._timerInterval as number);
    const { timeRemaining, penalties } = get();

    // SCORING ALGORITHM
    const COMPLETION_BONUS = 1000;

    // Time Factor: 30s remaining = 3000 pts. 1s remaining = 100 pts.
    const TIME_BONUS = Math.round(timeRemaining * 100);

    // Penalty Factor - EACH mistake is massive.
    const PENALTY_DEDUCTION = penalties * 500;

    let finalScore = COMPLETION_BONUS + TIME_BONUS - PENALTY_DEDUCTION;
    finalScore = Math.max(0, finalScore); // No negative scores

    set({ gameState: GameState.Finished, score: finalScore, progress: 100, _timerInterval: null });
  },

  resetGame: () => {
    if (get()._timerInterval) clearInterval(get()._timerInterval as number);
    set({
      gameState: GameState.NotStarted,
      score: 0,
      timeRemaining: TOTAL_TIME,
      progress: 0,
      pathPoints: [],
      _timerInterval: null,
      failReason: null
    });
  }
}));