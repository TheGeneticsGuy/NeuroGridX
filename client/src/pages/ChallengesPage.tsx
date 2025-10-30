import React from 'react';
import { Link } from 'react-router-dom';

const ChallengesPage: React.FC = () => {
  return (
    <div>
      <h1>Challenges</h1>
      <p>Select a challenge to play. Anyone can play!</p>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/challenges/click-accuracy" className="cta-button">
          Click Accuracy
        </Link>
      </div>
    </div>
  );
};

export default ChallengesPage;