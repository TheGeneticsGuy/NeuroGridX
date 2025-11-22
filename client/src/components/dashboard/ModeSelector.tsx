import React from 'react';
import './ModeSelector.css';

export type StatMode = 'Normal' | 'Advanced';

interface ModeSelectorProps {
  selectedMode: StatMode;
  onSelectMode: (mode: StatMode) => void;
}

// Reusable component to select mode to see which stats are showing on user dashboard.
const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onSelectMode }) => {
  return (
    <div className="mode-selector">
      <button
        className={selectedMode === 'Normal' ? 'active' : ''}
        onClick={() => onSelectMode('Normal')}
      >
        Normal
      </button>
      <button
        className={selectedMode === 'Advanced' ? 'active' : ''}
        onClick={() => onSelectMode('Advanced')}
      >
        Advanced
      </button>
    </div>
  );
};

export default ModeSelector;