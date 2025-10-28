import React from 'react';

const LoginPage: React.FC = () => {
  // The backend URL for the Google OAuth flow
  const googleAuthUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;; // Eventually set to env

  return (
    <div>
      <h1>Login to NeuroGrid</h1>
      <p>Please login to continue.</p>
      <button onClick={() => window.location.href = googleAuthUrl}>
        Login with Google
      </button>
    </div>
  );
};

export default LoginPage;