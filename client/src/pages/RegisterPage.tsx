import React, { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ValidationErrors from '../components/common/ValidationErrors';
import PasswordStrength from '../components/auth/PasswordStrength';
import { EyeOpenIcon, EyeClosedIcon } from '../assets/EyeIcon'; // Import icons
import axios from 'axios';
import '../styles/forms.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isBciApplicant, setIsBciApplicant] = useState(false);
  const [bciCompany, setBciCompany] = useState('');

  const navigate = useNavigate();
  const { setToken, isAuthenticated } = useAuthStore();
  const requiredFieldTitle = "This field is required.";

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]); // Clear all previous errorss

    if (isBciApplicant && !bciCompany.trim()) {
        setErrors(['Please enter your BCI Provider Company name.']);
        return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/register`, {
        email,
        password,
        firstName,
        lastName,
        isBciApplicant,
        bciCompany
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
      <form onSubmit={handleRegister} noValidate> {/* noValidate prevents default browser tooltips */}
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            className="form-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            title="Please enter your first name." // Custom tooltip text
            aria-label="First Name" // Accessibility
            maxLength={40}
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
            title="Please enter your last name."
            aria-label="Last Name"
            maxLength={40}
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
            title="Please enter a valid email address."
            aria-label="Email Address"
            maxLength={40}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input pw-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={30}
              title="Password must meet the requirements below."
              aria-label="Password"
            />
            <button
              type="button" // Important: prevents form submission
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        <div className="bci-application-section">
            <h3 className="bci-header">🦸 Superhero Powers Verification</h3>

            <div className="bci-checkbox-wrapper" onClick={() => setIsBciApplicant(!isBciApplicant)}>
                <input
                    id="bci-applicant"
                    type="checkbox"
                    checked={isBciApplicant}
                    onChange={() => {}} // Controlled by wrapper click
                />
                <label htmlFor="bci-applicant">I am a Brain-Computer Interface recipient.</label>
            </div>

            {isBciApplicant && (
                <>
                    <p className="bci-notice">
                        Please only select this if you have received a BCI implant.
                        After submitting, your BCI status will be listed as "Pending" until an admin can verify.
                    </p>
                    <div className="form-group">
                        <label htmlFor="bciCompany">BCI Provider Company *</label>
                        <input
                            id="bciCompany"
                            type="text"
                            className="form-input"
                            value={bciCompany}
                            onChange={(e) => setBciCompany(e.target.value)}
                            placeholder="e.g., Neuralink"
                            required // HTML validation
                        />
                        <small className="form-text">The name of the company that provided your implant.</small>
                    </div>
                </>
            )}
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