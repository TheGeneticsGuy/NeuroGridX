import React from 'react';
import { Link } from 'react-router-dom';
import './ChallengesPage.css';

const ChallengesPage: React.FC = () => {
  return (
    <div className="ChallengesPage">
      <h1>Challenges</h1>
      <p>Select a challenge. Anyone can play!</p>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/challenges/reaction-time" className="cta-button">
          Reaction Time
        </Link>
      </div>
    </div>
  );
};

export default ChallengesPage;