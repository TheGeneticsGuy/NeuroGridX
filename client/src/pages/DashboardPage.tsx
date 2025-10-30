import React from 'react';
import { useAuthStore } from '../store/auth.store';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <h1>Dashboard - PENDING</h1>
      <p>Welcome, {user?.role} user! This page is protected.</p>
      <p>DATA PLACEHOLDER.</p>
    </div>
  );
};

export default DashboardPage;