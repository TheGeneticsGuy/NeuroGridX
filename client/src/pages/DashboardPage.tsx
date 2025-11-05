import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import UserStats from '../components/dashboard/UserStats';

import '../styles/DashboardPage.css';

interface Attempt {
  _id: string;
  challengeType: string;
  score: number;
  accuracy: number;
  ntpm?: number;
  averageClickAccuracy?: number;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const { user, token } = useAuthStore();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!token) {
        setLoading(false);
        setError('Not authenticated.');
        return;
      }

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/attempts/my-attempts`, config);
        setAttempts(response.data);
      } catch (err) {
        setError('Failed to fetch challenge history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [token]);

  return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>My Dashboard</h1>
                {user && <p>Welcome! Review your performance and track your progress.</p>}
            </div>

            {!loading && !error && <UserStats attempts={attempts} />}

            {loading && <p className="loading-message">Loading history...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && (
                <>
                    <h2>Recent Attempts</h2>
                    {attempts.length === 0 ? (
                        <p className="no-attempts-message">You haven't completed any challenges yet. Go play one!</p>
                    ) : (
                        <table className="attempts-table">
                           {/* ... table remains the same ... */}
                        </table>
                    )}
                </>
            )}
        </div>
    );
};

export default DashboardPage;