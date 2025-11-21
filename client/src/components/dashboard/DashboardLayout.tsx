import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './DashboardLayout.css';

// Creating a sidebar
const DashboardLayout: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <nav>
          <NavLink to="/dashboard/overview" end>Overview</NavLink>
          <NavLink to="/dashboard/profile">Profile</NavLink>
          <NavLink to="/dashboard/security">Security</NavLink>
        </nav>
      </aside>
      <main className="dashboard-content">
        <Outlet /> {/* Child routes rendered here */}
      </main>
    </div>
  );
};

export default DashboardLayout;