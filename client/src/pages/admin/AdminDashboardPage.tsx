import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import './AdminDashboardPage.css';

// Components for the two main tabs (we'll build these next)
import AdminLiveFeed from './components/AdminLiveFeed';
import AdminAnalytics from './components/AdminAnalytics';

type AdminTab = 'live' | 'analytics';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

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
        </button>
      </div>

      {/* Main Content Area */}
      <div className="admin-content-area">
        {activeTab === 'live' ? <AdminLiveFeed /> : <AdminAnalytics />}
      </div>
    </div>
  );
};

export default AdminDashboardPage;