import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import UserStats from '../components/dashboard/UserStats';
import PerformanceChart from '../components/charts/PerformanceChart';
import { type Attempt } from '../types/challenge.types';
import ModeSelector, { type StatMode } from '../components/dashboard/ModeSelector';
import './DashboardPage.css';

const ITEMS_PER_PAGE = 25

const DashboardOverviewPage: React.FC = () => {
  const { token } = useAuthStore();
  const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [chartRange, setChartRange] = useState<number | 'all'>(30); // Default 30 days
  const [chartChallenge, setChartChallenge] = useState<string>('Reaction Time'); // Default

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

  // Pagination logic
  const [statMode, setStatMode] = useState<StatMode>('Normal');
  useEffect(() => {
    setCurrentPage(1);
  }, [statMode]);

  // Filtering for the graphs specifically
  const chartAttempts = useMemo(() => {
    return allAttempts.filter(a =>
        a.challengeType === chartChallenge &&
        (a.settings?.mode || 'Normal') === statMode
    );
  }, [allAttempts, chartChallenge, statMode]);

  const filteredAttempts = useMemo(() => {
    return allAttempts.filter(attempt => {
      const mode = attempt.settings?.mode || 'Normal';
      return mode === statMode;
    });
  }, [allAttempts, statMode]);

  const totalPages = Math.ceil(filteredAttempts.length / ITEMS_PER_PAGE);
  const displayedAttempts = filteredAttempts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );


  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

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

          {/* For the graphs */}
          <div className="chart-section-container">
            <div className="chart-controls">
                <h3>Performance Trends</h3>
                <div className="chart-filters">
                    <select
                        value={chartChallenge}
                        onChange={(e) => setChartChallenge(e.target.value)}
                        className="dashboard-select"
                    >
                        <option value="Reaction Time">Reaction Time</option>
                        <option value="Line Tracing">Line Tracing</option>
                    </select>

                    <select
                        value={chartRange}
                        onChange={(e) => setChartRange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="dashboard-select"
                    >
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={60}>Last 60 Days</option>
                        <option value={90}>Last 90 Days</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            <div className="chart-wrapper">
                <PerformanceChart
                    attempts={chartAttempts}
                    challengeName={`${chartChallenge} (${statMode})`}
                    days={chartRange}
                />
            </div>
          </div>

          <h2>Recent Attempts ({statMode} Mode)</h2>
          {filteredAttempts.length === 0 ? (
            <p className="no-attempts-message">No attempts found for {statMode} mode.</p>
          ) : (
            <>
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
                {displayedAttempts.map((attempt) => (
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
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                  >
                      Previous
                  </button>
                  <span className="page-info">
                      Page {currentPage} of {totalPages}
                  </span>
                  <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                  >
                      Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default DashboardOverviewPage;