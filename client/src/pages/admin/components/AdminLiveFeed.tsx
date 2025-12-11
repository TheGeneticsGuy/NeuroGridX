import React, { useEffect, useState } from 'react';
import { useSocketStore } from '../../../store/socket.store';
import '../AdminDashboardPage.css';
import './AdminLiveFeed.css';

interface LiveSession {
  socketId: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  game: {
    type: string;
    score: number;
    timeRemaining: number;
    hits?: number;
    misses?: number;
    progress?: number;
    mode?: string;
    speed?: string;
  };
  lastUpdate: number;
}

const AdminLiveFeed: React.FC = () => {
  const { socket } = useSocketStore();
  const [sessions, setSessions] = useState<Map<string, LiveSession>>(new Map());

  useEffect(() => {
    if (!socket) return;

    // Join the admin room
    socket.emit('admin_join');

    // Handle initial snapshot
    socket.on('init_active_sessions', (data: LiveSession[]) => {
      const map = new Map(data.map(s => [s.socketId, s]));
      setSessions(map);
    });

    // Handle live updates
    socket.on('live_session_update', (data: LiveSession) => {
      setSessions(prev => {
        const newMap = new Map(prev);
        newMap.set(data.socketId, data);
        return newMap;
      });
    });

    // Handle session end
    socket.on('session_ended', (socketId: string) => {
      setSessions(prev => {
        const newMap = new Map(prev);
        newMap.delete(socketId);
        return newMap;
      });
    });

    return () => {
      socket.off('init_active_sessions');
      socket.off('live_session_update');
      socket.off('session_ended');
    };
  }, [socket]);

  const activeList = Array.from(sessions.values());

  return (
    <div className="live-feed-container">
      <div className="feed-header">
        <h2>Live Sessions ({activeList.length})</h2>
        <span className="live-indicator">LIVE</span>
      </div>

      {activeList.length === 0 ? (
        <div className="no-sessions">
            <p>No users are currently playing.</p>
            <small>Open a game in another window to test!</small>
        </div>
      ) : (
        <div className="sessions-grid">
          {activeList.map(session => (
            <div key={session.socketId} className={`session-card ${session.user.role === 'BCI' ? 'bci-border' : ''}`}>
              <div className="session-header">
                <strong>{session.user.firstName} {session.user.lastName}</strong>
                <span className={`role-badge ${session.user.role}`}>{session.user.role}</span>
              </div>

              <div className="session-game-info">
                <div className="game-title">{session.game.type}</div>
                <div className="game-mode">{session.game.mode || 'Normal'} {session.game.speed ? `(${session.game.speed})` : ''}</div>
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
                        <div className="telemetry-item"><label>Hits</label>{session.game.hits}</div>
                        <div className="telemetry-item"><label>Misses</label>{session.game.misses}</div>
                    </>
                ) : (
                    <>
                        <div className="telemetry-item"><label>Progress</label>{Math.round(session.game.progress || 0)}%</div>
                        <div className="telemetry-item"><label>Mistakes</label>{session.game.misses || 0}</div>
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