import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AuthHandler from './components/auth/AuthHandler';
import { useAuthStore } from './store/auth.store';
import Layout from './components/layout/Layout';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
     <Router>
      {/* AuthHandler will run on every route change to check for a token */}
      <AuthHandler />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
        />
        {/*TODO: Add more routes to authenticated ujsers */}
      </Routes>
    </Router>
  );
}

export default App;