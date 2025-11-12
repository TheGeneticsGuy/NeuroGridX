import React, { useEffect } from 'react';
import { useUIStore } from '../../store/ui.store';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useUIStore();

  // This runs whenever selected light/dark theme changes.
  // Necessary to apply the theme to the actual DOM.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <label className="theme-toggle" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
      <span className="slider"></span>
    </label>
  );
};

export default ThemeToggle;