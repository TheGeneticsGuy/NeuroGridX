import React, { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ValidationErrors from '../components/common/ValidationErrors';

import axios from 'axios';
import '../styles/forms.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([])

  const navigate = useNavigate();
  const { setToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // If logged in, go to home page
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/login`, {
        email,
        password,
      });
      setToken(response.data.token, response.data);
      navigate('/'); // Navigate to home on successful login
    } catch (err: any) {
      setErrors([err.response?.data?.message || 'Login failed']);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google-token`, {
        token: credentialResponse.credential,
      });
      setToken(res.data.token, res.data);
      navigate('/'); // Navigate to home on successful login
    } catch (err) {
      console.error('Google login failed', err);
      setErrors(['Google login failed.']);
    }
  };

  return (
    <div className="form-container">
      <h1>Sign In</h1>
      <ValidationErrors errors={errors} />
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            title="Please enter your email address."
            aria-label="Email Address"
            maxLength={40}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={30}
            title="Please enter you password."
            aria-label="Password"
            required
          />
        </div>
        <button type="submit" className="form-button">Sign In</button>
      </form>
      <div className="form-divider"><span>OR</span></div>
      <div className="google-button-container">
        <GoogleOAuthProvider clientId={googleClientId}>
          <GoogleLogin
            theme='filled_blue'
            shape="pill"
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('Login Failed');
              setErrors(['Google login failed.']);
            }}
          />
        </GoogleOAuthProvider>
      </div>
      <p className="form-link">
        Don't have an account? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export default LoginPage;