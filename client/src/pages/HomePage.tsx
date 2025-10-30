import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="home-container">
      <h1>Welcome to NeuroGrid</h1>
      <p>The platform for testing Human-Computer Interaction, with a focus on BCI performance!</p>

      {isAuthenticated ? (
        <p>You are logged in. Your scores will be saved to your dashboard.</p>
      ) : (
        <p>You are browsing as a guest. <Link to="/login" className="login-prompt-link">Login</Link> to save your progress!</p>
      )}

      <div className="call-to-action">
        <Link to="/challenges" className="cta-button">
          Start a Challenge
        </Link>
      </div>
    </div>
  );
};

export default HomePage;