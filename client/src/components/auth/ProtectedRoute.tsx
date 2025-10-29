import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // If the user is authenticated, render the child route (like the Dashboard)
  // If not, direct them to the login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;