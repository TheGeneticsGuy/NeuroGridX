import React, { useState, type FormEvent } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import PasswordStrength from '../components/auth/PasswordStrength';
import ValidationErrors from '../components/common/ValidationErrors';
import '../styles/forms.css';
import './SecurityPage.css'; // We'll create this

const SecurityPage: React.FC = () => {
  const { token, logout } = useAuthStore();

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Deletion State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/users/password`,
        { currentPassword, newPassword },
        config
      );
      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/users`, config);
      logout(); // Log them out immediately
      window.location.href = '/'; // Force redirect to home
    } catch (err) {
      console.error(err);
      alert("Failed to delete account.");
    }
  };

  return (
    <div className="security-page-container">
      <h1>Security & Settings</h1>

      {/*CHANGE PASSWORD SECTION*/}
      <div className="security-section">
        <h2>Change Password</h2>
        {passwordMessage && (
          <div className={`message-banner ${passwordMessage.type}`}>
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="security-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password" className="form-input"
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password" className="form-input"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              required minLength={8}
            />
            <PasswordStrength password={newPassword} />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password" className="form-input"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="form-button">Update Password</button>
        </form>
      </div>

      {/*DANGER ZONE*/}
      <div className="security-section danger-zone">
        <h2>Danger Zone</h2>
        <p>Deleting your account is irreversible. All your data will be permanently removed.</p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="danger-button"
          >
            Delete Account
          </button>
        ) : (
          <div className="delete-confirmation">
            <p>Type <strong>DELETE</strong> to confirm.</p>
            <input
              type="text"
              className="form-input"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE"
            />
            <div className="delete-actions">
              <button
                onClick={handleDeleteAccount}
                className="danger-button"
                disabled={deleteInput !== 'DELETE'}
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPage;