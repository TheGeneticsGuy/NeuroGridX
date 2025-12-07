import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../../store/auth.store';
import ActivityChart from '../../../components/charts/ActivityChart';
import PerformanceChart from '../../../components/charts/PerformanceChart';
import Tooltip from '../../../components/tooltips/tooltips';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import '../AdminDashboardPage.css';

// --- Types ---
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  bciStatus: 'None' | 'Pending' | 'Verified' | 'Rejected';
  bciCompany?: string;
  createdAt: string;
}

interface AnalyticsData {
  attemptsByType: { _id: string; count: number; avgScore: number }[];
  activityOverTime: { _id: string; count: number }[];
  totalUsers: number;
}

const USERS_PER_PAGE = 25;

const AdminAnalytics: React.FC = () => {
  const { token } = useAuthStore();

  // View State
  const [viewMode, setViewMode] = useState<'global' | 'users' | 'user-detail'>('users'); // Default to users list

  // Analytics state
  const [timeRange, setTimeRange] = useState<string>('30');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // User Management state
  const [users, setUsers] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Specific user for the chart selection
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserAttempts, setSelectedUserAttempts] = useState<any[]>([]);
  const [globalRoleFilter, setGlobalRoleFilter] = useState<'all' | 'Standard' | 'BCI'>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'Standard' | 'BCI' | 'Admin'>('all');

  // Detail Controls
  const [detailTimeRange, setDetailTimeRange] = useState<number | 'all'>('all');
  const [detailChallenge, setDetailChallenge] = useState<string>('Reaction Time');
  const [detailMode, setDetailMode] = useState<'Normal' | 'Advanced'>('Normal');

  // The confirmation modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: 'success' | 'danger';
    onConfirm: () => void;
  } | null>(null);

  // --- Let's get the analytics now ---
  useEffect(() => {
    if (viewMode === 'global') {
        const fetchAnalytics = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // Pass BOTH days and role
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/admin/analytics/global?days=${timeRange}&role=${globalRoleFilter}`,
                    config
                );
                setAnalyticsData(data);
            } catch (error) {
                console.error("Failed to get analytics data", error);
            }
        };
        fetchAnalytics();
    }
  }, [token, viewMode, timeRange, globalRoleFilter]);

  // --- Let's get the users for filtering ---
  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, config);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setUserLoading(false);
    }
  };

  // Feteching for the graph
  const fetchUserStats = async (userId: string) => {
      try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/analytics/user/${userId}`, config);
          setSelectedUserAttempts(data.attempts);
          // Find the user object from our existing 'users' list
          const userObj = users.find(u => u._id === userId);
          if (userObj) setSelectedUser(userObj);

          // Switch view to 'user-detail'
          setViewMode('user-detail');
      } catch (error) {
          console.error("Error fetching user stats", error);
      }
  };

  const filteredUserAttempts = useMemo(() => {
      return selectedUserAttempts.filter(a =>
          a.challengeType === detailChallenge &&
          (a.settings?.mode || 'Normal') === detailMode
      );
  }, [selectedUserAttempts, detailChallenge, detailMode]);

  useEffect(() => {
    if (viewMode === 'users') {
        fetchUsers();
    }
  }, [token, viewMode]);

  // --- Need to handle status ---
  const triggerStatusUpdate = (userId: string, newStatus: 'Verified' | 'Rejected') => {
    const isReject = newStatus === 'Rejected';

    setModalConfig({
      title: isReject ? 'Reject BCI Request?' : 'Approve BCI Request?',
      message: `Are you sure you want to set this user's BCI status to ${newStatus}? This will notify the user.`,
      type: isReject ? 'danger' : 'success',
      onConfirm: () => performStatusUpdate(userId, newStatus),
    });
    setModalOpen(true);
  };

  const performStatusUpdate = async (userId: string, newStatus: 'Verified' | 'Rejected') => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}/bci-status`, { status: newStatus }, config);
      fetchUsers();
    } catch (error) {
      alert("Failed to update status"); // Simple alert for actual errors is fine, or use a toast
    } finally {
      setModalOpen(false); // Close modal
    }
  };

  // --- Get the derived state (Users) ---
  const pendingCount = useMemo(() => users.filter(u => u.bciStatus === 'Pending').length, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesFilter = filter === 'all' || (filter === 'pending' && user.bciStatus === 'Pending');
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
          user.email.toLowerCase().includes(searchLower) ||
          (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchLower);
      const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
      return matchesFilter && matchesSearch && matchesRole;
    });
  }, [users, filter, searchTerm, userRoleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const displayedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  return (
    <div className="admin-analytics-container">

      {/* Top Toggle Global Stats vs User List */}
      <div className="analytics-view-toggle">
        <button className={viewMode === 'users' ? 'active' : ''} onClick={() => setViewMode('users')}>
            User Management {pendingCount > 0 && <span className="badge-small">{pendingCount}</span>}
        </button>
        <button className={viewMode === 'global' ? 'active' : ''} onClick={() => setViewMode('global')}>
            Global Analytics
        </button>
      </div>

      {/* --- global view --- */}
      {viewMode === 'global' && (
          <div className="analytics-section">
              <div className="analytics-controls-row"> {/* Wrapper for controls */}
                  <div className="range-selector">
                      <label>Time Range:</label>
                      <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="60">Last 60 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="all">All Time</option>
                      </select>
                  </div>

                  {/* --- Role filter --- */}
                  <div className="range-selector">
                      <label>User Role:</label>
                      <select value={globalRoleFilter} onChange={(e) => setGlobalRoleFilter(e.target.value as any)}>
                          <option value="all">All Users</option>
                          <option value="Standard">Standard</option>
                          <option value="BCI">BCI</option>
                      </select>
                  </div>
              </div>


              {analyticsData ? (
                  <div className="charts-grid">
                      <div className="chart-card full-width">
                          <h3>Activity Trend</h3>
                          <ActivityChart
                            data={analyticsData.activityOverTime}
                            title={timeRange === 'all' ? 'All Activity' : `${timeRange}-Day Activity Trend`}
                            />
                      </div>
                      <div className="chart-card">
                          <h3>Total Users</h3>
                          <p className="big-stat">{analyticsData.totalUsers}</p>
                      </div>
                      {/* I might add more summary cards as needed */}
                      {analyticsData.attemptsByType.map(stat => (
                          <div key={stat._id} className="chart-card">
                              <h3>{stat._id}</h3>
                              <p>Plays: {stat.count}</p>
                              <p>Avg Score: {Math.round(stat.avgScore)}</p>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p>Loading analytics...</p>
              )}
          </div>
      )}

      {/* User Detail View */}
      {viewMode === 'user-detail' && selectedUser && (
        <div className="user-detail-view">
            <button className="back-btn" onClick={() => setViewMode('users')}>← Back to User List</button>

            <div className="user-header">
                <h2>Stats for: {selectedUser.firstName} {selectedUser.lastName}</h2>
                <span className={`status-badge ${selectedUser.role.toLowerCase()}`}>{selectedUser.role}</span>
            </div>

            <div className="analytics-controls-row" style={{marginTop: '1.5rem'}}>
                <div className="range-selector">
                    <label>Challenge:</label>
                    <select value={detailChallenge} onChange={(e) => setDetailChallenge(e.target.value)}>
                        <option value="Reaction Time">Reaction Time</option>
                        <option value="Line Tracing">Line Tracing</option>
                    </select>
                </div>
                <div className="range-selector">
                    <label>Mode:</label>
                    <select value={detailMode} onChange={(e) => setDetailMode(e.target.value as any)}>
                        <option value="Normal">Normal</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
                <div className="range-selector">
                    <label>Time Range:</label>
                    <select value={detailTimeRange} onChange={(e) => setDetailTimeRange(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 90 Days</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            <div className="chart-card full-width">
                <PerformanceChart
                    attempts={filteredUserAttempts}
                    challengeName={`${detailChallenge} (${detailMode})`}
                    days={detailTimeRange}
                />
            </div>
        </div>
      )}

      {/* --- User Management view with pagination --- */}
      {viewMode === 'users' && (
        <>
            <div className="admin-controls">
                <div className="filter-buttons">
                    <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Users</button>
                    <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                        Pending BCI {pendingCount > 0 && <span className="pending-badge">{pendingCount}</span>}
                    </button>
                </div>
                <input type="text" placeholder="Search users..." className="admin-search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                {/* Role filtering */}
                <div className="search-and-filter">
                    <select
                        className="admin-select"
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    >
                        <option value="all">All Roles</option>
                        <option value="Standard">Standard</option>
                        <option value="BCI">BCI</option>
                        <option value="Admin">Admin</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Search users..."
                        className="admin-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {userLoading ? <p>Loading users...</p> : (
                <>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th><th>Email</th><th>Role</th><th>BCI Status</th><th>Company</th><th>Joined</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedUsers.map(user => (
                            <tr key={user._id}>
                                <td
                                    className="clickable-name"
                                    onClick={() => fetchUserStats(user._id)}
                                >
                                  <Tooltip text="Click to view detailed stats">
                                    {user.firstName} {user.lastName}
                                  </Tooltip>
                                </td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td><span className={`status-badge ${user.bciStatus.toLowerCase()}`}>{user.bciStatus}</span></td>
                                <td>{user.bciCompany || '-'}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {user.bciStatus === 'Pending' && (
                                        <div className="action-buttons">
                                            <button className="approve-btn" onClick={() => triggerStatusUpdate(user._id, 'Verified')}>Approve</button>
                                            <button className="reject-btn" onClick={() => triggerStatusUpdate(user._id, 'Rejected')}>Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Modal for Confirmation */}
                {modalConfig && (
                    <ConfirmationModal
                        isOpen={modalOpen}
                        title={modalConfig.title}
                        message={modalConfig.message}
                        type={modalConfig.type}
                        onConfirm={modalConfig.onConfirm}
                        onCancel={() => setModalOpen(false)}
                        confirmText={modalConfig.type === 'danger' ? 'Reject' : 'Approve'}
                    />
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="pagination-controls">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="pagination-btn">Prev</button>
                        <span className="page-info">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="pagination-btn">Next</button>
                    </div>
                )}
                </>
            )}
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;