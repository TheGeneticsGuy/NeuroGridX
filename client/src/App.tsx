import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  const isAuthenticated = false;

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <HomePage /> : <LoginPage />} />
        {/* TODO: add more routes here, like /dashboard, /challenges etc. */}
      </Routes>
    </Router>
  );
}

export default App;