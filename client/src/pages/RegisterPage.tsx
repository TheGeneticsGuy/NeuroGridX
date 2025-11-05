import React, { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ValidationErrors from '../components/common/ValidationErrors';
import PasswordStrength from '../components/auth/PasswordStrength';

import axios from 'axios';
import '../styles/forms.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<string[]>([])

  const navigate = useNavigate();
  const { setToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]); // Clear all previous errorss

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/register`, {
        email,
        password,
        firstName,
        lastName,
      });
      setToken(response.data.token);
      navigate('/dashboard'); // Navigate to dashboard on successful registration

    } catch (err: any) {
      if (err.response?.data?.messages) {
        setErrors(err.response.data.messages);
      } else {
        setErrors([err.response?.data?.message || 'Registration failed']);
      }
    }
  };

  // Google OAuth success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google-token`, {
        token: credentialResponse.credential,
      });
      setToken(res.data.token);
      navigate('/dashboard'); // Navigate to dashboard on successful registration
    } catch (err) {
      console.error('Google registration failed', err);
      setErrors(['Google registration failed.']);
    }
  };

  return (
    <div className="form-container">
      <h1>Create an Account</h1>
      <ValidationErrors errors={errors} />
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            className="form-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            className="form-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            required
            minLength={6}
          />
          <PasswordStrength password={password} />
        </div>
        <button type="submit" className="form-button">Create Account</button>
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
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
};

export default RegisterPage;