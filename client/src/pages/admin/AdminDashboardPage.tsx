import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import AdminLiveFeed from './components/AdminLiveFeed';
import AdminAnalytics from './components/AdminAnalytics';
import { useSocketStore } from '../../store/socket.store';
import './AdminDashboardPage.css';

type AdminTab = 'live' | 'analytics';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [activeUserIds, setActiveUserIds] = useState<Set<string>>(new Set());
   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Importand and listening to socket so I can get Live feed status for the button count and user
  useEffect(() => {
    if (!socket) return;

    const updateActiveList = (data: any[]) => {
        setActiveUserIds(new Set(data.map((s: any) => s.user._id)));
    };

    socket.on('init_active_sessions', updateActiveList);

    // For the live badge next to names I think ids is sufficient
    socket.on('live_session_update', (data: any) => {
        setActiveUserIds(prev => {
            const next = new Set(prev);
            next.add(data.user._id);
            return next;
        });
    });

    socket.on('session_ended', (userId: string) => {
        setActiveUserIds(prev => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
        });
    });

    // Initial request if not already joined
    socket.emit('admin_join');

    return () => {
        socket.off('init_active_sessions');
        socket.off('live_session_update');
        socket.off('session_ended');
    };
  }, [socket]);

  const handleViewUser = (userId: string) => {
      setSelectedUserId(userId);
      setActiveTab('analytics'); // Switch to the analytics tab
  };

  // Handler for clearing selection
  const clearSelection = () => {
      setSelectedUserId(null);
  }

  // Double check admin role on frontend
  if (!user || user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics & Users
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          Live Mirror Feed
          {/* Live Feed Button*/}
          {activeUserIds.size > 0 && <span className="live-badge-btn">{activeUserIds.size}</span>}
        </button>
      </div>

      <div className="admin-content-area">
        {activeTab === 'live' ? (
            <AdminLiveFeed onViewUser={handleViewUser} />
        ) : (
            <AdminAnalytics
                activeUserIds={activeUserIds}
                onNavigateToLive={() => setActiveTab('live')}
                initialUserId={selectedUserId}
                onClearSelection={clearSelection}
            />
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;