import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ChallengesPage from './pages/ChallengesPage';
import AuthHandler from './components/auth/AuthHandler';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import ReactionTimePage from './pages/ReactionTimePage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import ProfilePage from './pages/ProfilePage';
import SecurityPage from './pages/SecurityPage';
import LineTracingPage from './pages/LineTracingPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

function App() {

  return (
    <Router>
      <AuthHandler />
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/challenges/reaction-time" element={<ReactionTimePage />} />
          <Route path="/challenges/line-tracing" element={<LineTracingPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<DashboardOverviewPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="security" element={<SecurityPage />} />
            </Route>
          </Route>

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route index element={<AdminDashboardPage />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;