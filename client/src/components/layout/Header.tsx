import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import ThemeToggle from '../common/ThemeToggle';
import './Header.css';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  // LogOut Logic - Easily manageable.
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          NeuroGrid
        </Link>
        <div>
          <ThemeToggle /> MODE
        </div>
        <nav>
          <div className="nav-links">
            <Link to="/challenges">Challenges</Link>

            {isAuthenticated ? (
              <> {/* Using a React Fragment */}
                <Link to="/dashboard">Dashboard</Link>

                {/* Admin Only Dash */}
                {user?.role === 'Admin' && (
                      <Link to="/admin" className="admin-link">Admin</Link>
                  )}

                <span className="user-info">Role: {user?.role}</span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </>
            ) : (
              <> {/* Using a React Fragment */}
                <Link to="/login">Login</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;