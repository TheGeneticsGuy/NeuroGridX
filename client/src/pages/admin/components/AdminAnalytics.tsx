import React, { useState, useEffect, useMemo } from 'react'; // Add useMemo
import axios from 'axios';
import { useAuthStore } from '../../../store/auth.store';
import '../AdminDashboardPage.css';

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

const USERS_PER_PAGE = 25; // Pagination Limit

const AdminAnalytics: React.FC = () => {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`, config);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const handleStatusUpdate = async (userId: string, newStatus: 'Verified' | 'Rejected') => {
    if (!window.confirm(`Are you sure you want to set this user to ${newStatus}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}/bci-status`, { status: newStatus }, config);
      fetchUsers();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  // Calculating Pending Count for the Badge
  const pendingCount = useMemo(() => {
    return users.filter(u => u.bciStatus === 'Pending').length;
  }, [users]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesFilter = filter === 'all' || (filter === 'pending' && user.bciStatus === 'Pending');
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
          user.email.toLowerCase().includes(searchLower) ||
          (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchLower);
      return matchesFilter && matchesSearch;
    });
  }, [users, filter, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  return (
    <div className="admin-analytics-container">
      <div className="admin-controls">
        <div className="filter-buttons">
            <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
            >
                All Users
            </button>
            <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
            >
                Pending BCI Requests
                {pendingCount > 0 && <span className="pending-badge">{pendingCount}</span>}
            </button>
        </div>

        <input
            type="text" placeholder="Search users..." className="admin-search"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>BCI Status</th>
                <th>BCI Company</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map(user => (
                <tr key={user._id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td><span className={`status-badge ${user.bciStatus.toLowerCase()}`}>{user.bciStatus}</span></td>
                  <td>{user.bciCompany || '-'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                      {user.bciStatus === 'Pending' && (
                          <div className="action-buttons">
                              <button className="approve-btn" onClick={() => handleStatusUpdate(user._id, 'Verified')}>Approve</button>
                              <button className="reject-btn" onClick={() => handleStatusUpdate(user._id, 'Rejected')}>Reject</button>
                          </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/*  PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="page-info">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;