import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import UserStats from '../components/dashboard/UserStats';
import { type Attempt } from '../config/challenges.config';
import './DashboardPage.css';

type StatMode = 'Normal' | 'Advanced';

const DashboardPage: React.FC = () => {
  const { user, token } = useAuthStore();
  const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statMode, setStatMode] = useState<StatMode>('Normal');

  useEffect(() => {

    // We need to get all total attempts
    const fetchAttempts = async () => {
        if (!token) { setLoading(false); setError('Not authenticated.'); return; }
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/challenges/attempts/my-attempts`, config);
            setAllAttempts(response.data);
        } catch (err) {
            setError('Failed to fetch challenge history.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchAttempts();
  }, [token]);

  // Filtering attempts by mode (advanced or Normal)
  const filteredAttempts = useMemo(() => {
    return allAttempts.filter(attempt => {
      const mode = attempt.settings?.mode || 'Normal';
      return mode === statMode;
    });
  }, [allAttempts, statMode]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        {user && <p>Review your performance and track your progress.</p>}
      </div>

      <div className="mode-selector">
        <button
          className={statMode === 'Normal' ? 'active' : ''}
          onClick={() => setStatMode('Normal')}
        >
          Normal Mode
        </button>
        <button
          className={statMode === 'Advanced' ? 'active' : ''}
          onClick={() => setStatMode('Advanced')}
        >
          Advanced Mode
        </button>
      </div>

      {!loading && !error && <UserStats attempts={filteredAttempts} />}

      {loading && <p className="loading-message">Loading history...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <h2>Recent Attempts ({statMode} Mode)</h2>
          {filteredAttempts.length === 0 ? (
            <p className="no-attempts-message">No attempts found for {statMode} mode.</p>
          ) : (
            <table className="attempts-table">
              <tbody>
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt._id}>
                    {/*  table data */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;