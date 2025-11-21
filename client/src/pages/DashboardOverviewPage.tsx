import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import UserStats from '../components/dashboard/UserStats';
import { type Attempt } from '../config/challenges.config';
import ModeSelector, { type StatMode } from '../components/dashboard/ModeSelector';
import './DashboardPage.css';

const DashboardOverviewPage: React.FC = () => {
  const { user, token } = useAuthStore();
  const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statMode, setStatMode] = useState<StatMode>('Normal');

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!token) {
        setLoading(false);
        setError('Not authenticated.');
        return;
      }
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

  const filteredAttempts = useMemo(() => {
    return allAttempts.filter(attempt => {
      const mode = attempt.settings?.mode || 'Normal';
      return mode === statMode;
    });
  }, [allAttempts, statMode]);

  return (
    // Note,The parent div is on the DashboardLayout component.
    <>
      <div className="dashboard-header">
        <h1>Performance Overview</h1>
        <ModeSelector selectedMode={statMode} onSelectMode={setStatMode} />
      </div>

      {loading && <p className="loading-message">Loading history...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          {/* Pass filtered attempts to stats component */}
          <UserStats attempts={filteredAttempts} />

          <h2>Recent Attempts ({statMode} Mode)</h2>
          {filteredAttempts.length === 0 ? (
            <p className="no-attempts-message">No attempts found for {statMode} mode.</p>
          ) : (
            <table className="attempts-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Challenge</th>
                  <th>Score</th>
                  <th>Speed</th>
                  <th>NTPM</th>
                  <th>Click Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt._id}>
                    <td>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                    <td>{attempt.challengeType}</td>
                    <td>{attempt.score.toLocaleString()}</td>
                    <td>{attempt.settings?.speed ?? 'N/A'}</td>
                    <td>{attempt.ntpm ?? 'N/A'}</td>
                    <td>{attempt.averageClickAccuracy ? `${(attempt.averageClickAccuracy * 100).toFixed(1)}%` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </>
  );
};

export default DashboardOverviewPage;