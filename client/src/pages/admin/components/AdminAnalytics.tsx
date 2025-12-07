import React, { useState, useEffect } from 'react';
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

const AdminAnalytics: React.FC = () => {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Users
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

  // Handle Status Update (Approve/Reject)
  const handleStatusUpdate = async (userId: string, newStatus: 'Verified' | 'Rejected') => {
    if (!window.confirm(`Are you sure you want to set this user to ${newStatus}?`)) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}/bci-status`,
        { status: newStatus },
        config
      );
      // Refresh list after update
      fetchUsers();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  // Filtering Logic
  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || (filter === 'pending' && user.bciStatus === 'Pending');
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
        user.email.toLowerCase().includes(searchLower) ||
        (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

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
            </button>
        </div>

        <input
            type="text"
            placeholder="Search users..."
            className="admin-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
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
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                    <span className={`status-badge ${user.bciStatus.toLowerCase()}`}>
                        {user.bciStatus}
                    </span>
                </td>
                <td>{user.bciCompany || '-'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    {user.bciStatus === 'Pending' && (
                        <div className="action-buttons">
                            <button
                                className="approve-btn"
                                onClick={() => handleStatusUpdate(user._id, 'Verified')}
                            >
                                Approve
                            </button>
                            <button
                                className="reject-btn"
                                onClick={() => handleStatusUpdate(user._id, 'Rejected')}
                            >
                                Reject
                            </button>
                        </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminAnalytics;