import React from 'react';
import { Link } from 'react-router-dom';

const ChallengesPage: React.FC = () => {
  return (
    <div>
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