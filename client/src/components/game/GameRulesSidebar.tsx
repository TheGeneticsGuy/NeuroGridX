import React from 'react';
import { useUIStore } from '../../store/ui.store';
import './GameRulesSidebar.css';

interface GameRulesProps {
  mode: 'Reaction Time' | 'Line Tracing';
}

const GameRulesSidebar: React.FC<GameRulesProps> = ({ mode }) => {
  const { gameSettings } = useUIStore();  // This is so i can read global settings directly.

  // Calculating the pts depending on the settings
  const getMultiplier = () => {
    if (!gameSettings.isAdvanced) return 1;
    if (gameSettings.speed === 'Medium') return 1.66;
    if (gameSettings.speed === 'Fast') return 2.0;
    return 1.33;
  };

  const mult = getMultiplier();
  const p = (base: number) => Math.round(base * mult);

  return (
    <div className="game-rules-bottom-bar">
      <div className="rules-header">
        <h3>Rules & Scoring {gameSettings.isAdvanced ? `(Advanced - ${gameSettings.speed})` : '(Normal)'}</h3>
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