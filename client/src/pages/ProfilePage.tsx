import React, { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import ValidationErrors from '../components/common/ValidationErrors';
import '../styles/forms.css';

const ProfilePage: React.FC = () => {
  const { token, updateUser } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  // Let's track issues as well
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile`, config); // Setting the location
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setEmail(data.email || '');
        setBio(data.bio || '');
      } catch (error) {
        setErrors(['Failed to load profile data.']);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(null);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile`,
        { firstName, lastName, email, bio },
        config
      );

      // Update the global state
      updateUser(data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 10000); // Clear success message after 10 seconds - just QOL
    } catch (err: any) {
      if (err.response?.data?.messages) {
        setErrors(err.response.data.messages);
      } else {
        setErrors([err.response?.data?.message || 'Update failed']);
      }
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
      <h1>Profile & Settings</h1>
      <div className="form-container">
        {success && <p style={{ color: 'lightgreen', marginBottom: '1rem' }}>{success}</p>}
        <ValidationErrors errors={errors} />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName" type="text" className="form-input"
              value={firstName} onChange={(e) => setFirstName(e.target.value)}
              maxLength={40} required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName" type="text" className="form-input"
              value={lastName} onChange={(e) => setLastName(e.target.value)}
              maxLength={40} required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email" type="email" className="form-input"
              value={email} onChange={(e) => setEmail(e.target.value)}
              maxLength={40} required
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio" className="form-input"
              value={bio} onChange={(e) => setBio(e.target.value)}
              maxLength={200} rows={4}
              placeholder="Tell us a little about yourself..."
            />
          </div>
          <button type="submit" className="form-button">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;