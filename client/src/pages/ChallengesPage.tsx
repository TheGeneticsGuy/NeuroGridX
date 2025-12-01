import React from 'react';
import { Link } from 'react-router-dom';
import './ChallengesPage.css';

const ChallengesPage: React.FC = () => {
  return (
    <div className="challenges-page-container">
      <h1>Select a Challenge</h1>
      <div className="challenge-cards-grid">

        {/* Reaction Time Card */}
        <Link to="/challenges/reaction-time" className="challenge-card">
          <h2>Reaction Time</h2>
          <p>Test your reflexes and accuracy.</p>
        </Link>

        {/* Line Tracing Card */}
        <Link to="/challenges/line-tracing" className="challenge-card">
          <h2>Line Tracing</h2>
          <p>Test your ability to keep the cursor steady with path following.</p>
        </Link>

      </div>
    </div>
  );
};



export default ChallengesPage;