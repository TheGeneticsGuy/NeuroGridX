import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChallengesPage from './pages/ChallengesPage';
import AuthHandler from './components/auth/AuthHandler';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import ReactionTimePage from './pages/ReactionTimePage';

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

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />

          {/* Placeholder for future protected routes */}
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;