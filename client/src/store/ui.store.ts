import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';
type Speed = 'Normal' | 'Medium' | 'Fast';

interface UIState {
  theme: Theme;
  gameSettings: GameSettings;
  toggleTheme: () => void;
  setGameSettings: (settings: Partial<GameSettings>) => void;
}

interface GameSettings {
  isAdvanced: boolean;
  speed: Speed;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      gameSettings: { isAdvanced: false, speed: 'Normal' },
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setGameSettings: (settings) => set((state) => ({
        gameSettings: { ...state.gameSettings, ...settings }
      })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme }), // I am only persisting the theme in the settings. The "mode" will default for each session.
    }
  )
);