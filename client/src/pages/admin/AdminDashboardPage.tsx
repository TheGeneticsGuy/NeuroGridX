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
  const activeSessions = useSocketStore((state) => state.activeSessions);
  const { enterAdminMode, leaveAdminMode } = useSocketStore();
  const activeUserIds = new Set(activeSessions.keys());
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    enterAdminMode();
    return () => {
        leaveAdminMode();
    };
  }, [enterAdminMode, leaveAdminMode]);

  // const handleViewUser = (userId: string) => {
  //     setSelectedUserId(userId);
  //     setActiveTab('analytics');
  // };

  const clearSelection = () => {
      setSelectedUserId(null);
  }

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
          {activeSessions.size > 0 && <span className="live-badge-btn">{activeSessions.size}</span>}
        </button>
      </div>

      <div className="admin-content-area">
        {activeTab === 'live' ? (
            <AdminLiveFeed />
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