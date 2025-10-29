import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import './Header.css';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  // LogOut Logic - Easily manageable.
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          NeuroGrid
        </Link>
        <nav>
          {isAuthenticated ? (
            <div className="nav-links">
              <Link to="/challenges">Challenges</Link>
              <Link to="/dashboard">Dashboard</Link>
              <span className="user-info">Logged in as: {user?.role}</span>     {/* TESTING */}
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-links">
              <Link to="/login">Login</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;