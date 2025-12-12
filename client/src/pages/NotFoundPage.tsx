import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '60vh', textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>404</h1>
      <h2 style={{ marginBottom: '1.5rem' }}>Neural Link Severed</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="cta-button">Return to Grid</Link>
    </div>
  );
};

export default NotFoundPage;