import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ChallengesPage from './pages/ChallengesPage';
import ScrollToTop from './components/common/ScrollToTop';
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
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import CookieBanner from './components/common/CookieBanner';
import { useAuthStore } from './store/auth.store';

// Websocket Needs
import { useSocketStore } from './store/socket.store';
import { useEffect } from 'react';

function App() {
  const { connect, disconnect } = useSocketStore();
  const { user } = useAuthStore();
  const { socket } = useSocketStore();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (socket && user) {
        socket.emit('identify', {
            _id: user.id || (user as any)._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        });
    }
  }, [socket, user]);

  return (
    <Router>
      <ScrollToTop />
      <AuthHandler />
      <CookieBanner />

      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/challenges/reaction-time" element={<ReactionTimePage />} />
          <Route path="/challenges/line-tracing" element={<LineTracingPage />} />
          <Route path="/about" element={<AboutPage />} />

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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>

    </Router>
  );
}

export default App;