import React from 'react';
import { useUIStore } from '../../store/ui.store';
import './GameRulesSidebar.css';

interface GameRulesProps {
  mode: 'Reaction Time' | 'Line Tracing';
}

const GameRulesSidebar: React.FC<GameRulesProps> = ({ mode }) => {
  const { gameSettings } = useUIStore();  // This is so i can read global settings directly.
  const isReactionTime = mode === 'Reaction Time';
  const effectiveAdvanced = isReactionTime && gameSettings.isAdvanced;
  const effectiveSpeed = isReactionTime ? gameSettings.speed : 'Normal';

  // Calculating the pts depending on the settings
  const getMultiplier = () => {
    if (!effectiveAdvanced) return 1;
    if (effectiveSpeed === 'Medium') return 1.66;
    if (effectiveSpeed === 'Fast') return 2.0;
    return 1.33;
  };

  const mult = getMultiplier();
  const p = (base: number) => Math.round(base * mult);

  // Let's get the header depending on if normal or advanced mode
  const getTitleSuffix = () => {
      if (mode === 'Line Tracing') return ''; // Line Tracing is always standard for now
      return gameSettings.isAdvanced ? `(Advanced - ${gameSettings.speed})` : '(Normal)';
  };

  return (
    <div className="game-rules-bottom-bar">
      <div className="rules-header">
        <h3>Rules & Scoring {getTitleSuffix()}</h3>
      </div>

      {mode === 'Reaction Time' && (
        <div className="rules-content-horizontal">
          <div className="rule-section goal">
            <strong>Goal:</strong> Click targets as fast as possible.
          </div>

          <div className="rule-section scores">
            <div className="score-item">
              <span>Hit (Base)</span>
              <span className="points">+{p(25)} - {p(100)}</span>
            </div>
            <div className="score-item bonus">
              <span>Bullseye (&gt;75%)</span>
              <span className="points">+{p(50)} Bonus</span>
            </div>
            <div className="score-item penalty">
              <span>Miss</span>
              <span className="points">-{p(25)}</span>
            </div>
          </div>

          <div className="rule-section info">
            <small>Score scales with distance to center. Multiplier: <strong>{mult}x</strong></small>
          </div>
        </div>
      )}

      {mode === 'Line Tracing' && (
        <div className="rules-content-horizontal">
          <div className="rule-section goal">
            <strong>Goal:</strong> Trace the line to the finish.
          </div>

          <div className="rule-section scores">
            <div className="score-item">
              <span>Completion</span>
              <span className="points">+1000</span>
            </div>
            <div className="score-item bonus">
              <span>Time Remaining Bonus</span>
              <span className="points">+100/sec</span>
            </div>
            <div className="score-item penalty">
              <span>Off-Path</span>
              <span className="points">-500</span>
            </div>
          </div>

          <div className="rule-section info">
            <small>2.0s grace period. Section Skip Restricted.</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRulesSidebar;