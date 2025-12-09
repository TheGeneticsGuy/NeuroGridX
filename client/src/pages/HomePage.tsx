import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            {isAuthenticated ? `Welcome back, ${user?.firstName || 'User'}` : 'Telepathy is now Reality'}
          </h1>
          <p className="hero-subtitle">
            Experience the future of human-computer interaction. Test your cognitive reflexes and motor precision with our advanced BCI calibration suite.
          </p>
          {!isAuthenticated && (
            <div className="hero-buttons">
              <Link to="/register" className="cta-button primary">Get Started</Link>
              <Link to="/about" className="cta-button secondary">Learn More</Link>
            </div>
          )}
        </div>
      </section>

      {/* Challenge Quick Access (Grid) */}
      <section className="challenges-section">
        <h2>Select a Challenge</h2>
        <div className="challenge-grid">

          {/* Reaction Time Card */}
          <Link to="/challenges/reaction-time" className="challenge-card-home">
            <div className="card-icon reaction-icon">⚡</div>
            <h3>Reaction Time</h3>
            <p>Test your speed and accuracy hitting targets.</p>
            <div className="play-link">Start Challenge →</div>
          </Link>

          {/* Line Tracing Card */}
          <Link to="/challenges/line-tracing" className="challenge-card-home">
            <div className="card-icon line-icon">〰️</div>
            <h3>Line Tracing</h3>
            <p>Follow the path with steady precision.</p>
            <div className="play-link">Start Challenge →</div>
          </Link>

          {/* Coming Soon Card */}
          <div className="challenge-card-home disabled">
            <div className="card-icon locked-icon">🔒</div>
            <h3>Velocity Control</h3>
            <p>Match speed profiles. (Coming Soon)</p>
          </div>

        </div>
      </section>

      {/* Educational Teaser */}
      <section className="info-teaser-section">
        <div className="teaser-content">
          <h2>Understanding the Tech</h2>
          <p>
            Brain-Computer Interfaces are changing lives. Learn how Neuralink and other pioneers are restoring autonomy to those with paralysis.
          </p>
          <Link to="/about" className="text-link">Read about the Science →</Link>
        </div>
      </section>

    </div>
  );
};

export default HomePage;