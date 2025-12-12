import React from 'react';
import { useSocketStore } from '../../../store/socket.store';
import '../AdminDashboardPage.css';
import './AdminLiveFeed.css';

const AdminLiveFeed: React.FC = () => {
  const sessions = useSocketStore((state) => state.activeSessions);
  const activeList = Array.from(sessions.values());

  return (
    <div className="live-feed-container">
      <div className="feed-header">
        <h2>Live Sessions ({activeList.length})</h2>
        <span className="live-indicator">LIVE</span>
      </div>

      {activeList.length === 0 ? (
        <div className="no-sessions"><p>No active sessions.</p></div>
      ) : (
        <div className="sessions-grid">
          {activeList.map(session => (
            <div
                key={session.user._id}
                className={`session-card ${session.user.role === 'BCI' ? 'bci-border' : ''} ${session.game.status === 'Finished' ? 'finished-state' : ''}`}
            >
              <div className="session-header">
                <strong>{session.user.firstName} {session.user.lastName}</strong>
                <span className={`role-badge ${session.user.role}`}>{session.user.role}</span>
              </div>

              <div className="session-game-info">
                <div className="game-title">{session.game.type}</div>
                <div className="game-mode">
                    {session.game.mode} {session.game.speed && `(${session.game.speed})`}
                    {session.game.status === 'Finished' && <span className="status-finished"> (Finished)</span>}
                </div>
              </div>

              <div className="telemetry-grid">
                <div className="telemetry-item">
                    <label>Time</label>
                    <span className={session.game.timeRemaining < 10 ? 'text-danger' : ''}>
                        {session.game.timeRemaining.toFixed(1)}s
                    </span>
                </div>
                <div className="telemetry-item">
                    <label>Score</label>
                    <span className="text-score">{Math.round(session.game.score)}</span>
                </div>

                {session.game.type === 'Reaction Time' ? (
                    <>
                        <div className="telemetry-item">
                          <label>Hits</label>
                          {session.game.hits}
                        </div>
                        <div className="telemetry-item">
                          <label>Misses</label>
                          {session.game.misses}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="telemetry-item">
                            <label>Distance</label>
                            <span>{Math.round(Number(session.game.progress || 0))}%</span>
                        </div>
                        <div className="telemetry-item">
                            <label>Penalties</label>
                            <span>{session.game.misses || 0}</span>
                        </div>
                    </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLiveFeed;