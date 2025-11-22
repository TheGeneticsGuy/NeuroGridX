import React, { useState, useEffect, type FormEvent } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import ValidationErrors from '../components/common/ValidationErrors';
import './ProfilePage.css';
import '../styles/forms.css';

const ProfilePage: React.FC = () => {
  const { token, updateUser } = useAuthStore();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [isBciApplicant, setIsBciApplicant] = useState(false);
  const [bciCompany, setBciCompany] = useState('');

  // UI State
  const [memberSince, setMemberSince] = useState('');
  const [originalBciStatus, setOriginalBciStatus] = useState<'None' | 'Pending' | 'Verified' | 'Rejected'>('None');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'info' | 'bci', text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile`, config);
         const safeBciStatus = data.bciStatus || 'None';
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setEmail(data.email || '');
        setBio(data.bio || '');
        setPhone(data.phone || '');
        setBciCompany(data.bciCompany || '');
        setIsBciApplicant(safeBciStatus !== 'None');
        setOriginalBciStatus(safeBciStatus);
        setMemberSince(new Date(data.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
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
    setFeedbackMessage(null);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { firstName, lastName, email, bio, phone, isBciApplicant, bciCompany };
      const { data } = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile`, payload, config);

      if (data.message === 'No changes were made to the profile.') {
        setFeedbackMessage({ type: 'info', text: data.message });
      } else {
        updateUser(data); // Update global state
        setFeedbackMessage({ type: 'success', text: data.message });
        if (data.bciStatusMessage) {
            // Show the BCI pending message as well
            setTimeout(() => setFeedbackMessage({ type: 'bci', text: data.bciStatusMessage }), 1000);
        }
      }
    } catch (err: any) {
      setErrors(err.response?.data?.messages || ['Update failed']);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-page-container">
      <h1>Profile & Settings</h1>
      {memberSince && <p className="member-since">Member since {memberSince}</p>}

      {feedbackMessage && <div className={feedbackMessage.type === 'info' ? 'no-changes-message' : 'success-message'}>{feedbackMessage.text}</div>}
      <ValidationErrors errors={errors} />

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input id="firstName" type="text" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input id="lastName" type="text" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input id="email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number (Optional)</label>
          <input
            id="phone" type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="123-456-7890"
            />
            <small className="form-text">Format: 123-456-7890</small>
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio (Optional)</label>
          <textarea
            id="bio" className="form-input"
            value={bio} onChange={(e) => setBio(e.target.value)}
            maxLength={300}
            rows={4}
            placeholder="Tell us a little about yourself..."
          />
          <small className="form-text">{bio.length}/300 characters</small>
        </div>

        {/* BCI Application Section */}
        <div className="bci-application-section">
            <h3 className="bci-header">🦸 Superhero Powers Verification</h3>

            {/* Visual Status Indicators */}
            {originalBciStatus === 'Verified' && (
                <div className="status-banner verified">
                    <span className="icon">✅</span>
                    <div>
                        <strong>Verified BCI Recipient</strong>
                        <p>Thank you for verifying your device. Advanced features are unlocked.</p>
                    </div>
                </div>
            )}

            {originalBciStatus === 'Pending' && (
                <div className="status-banner pending">
                    <span className="icon">⏳</span>
                    <div>
                        <strong>Verification Pending</strong>
                        <p>An administrator will review your application soon.</p>
                    </div>
                </div>
            )}

            {originalBciStatus === 'Rejected' && (
                <div className="status-banner rejected">
                    <span className="icon">🚫</span>
                    <div>
                        <strong>Verification Unable to be Confirmed</strong>
                        <p>We couldn't verify your BCI status at this time. If this is a mistake, please <a href="/contact">Contact Us</a>.</p>
                    </div>
                </div>
            )}

            {/* Application Form (Only show if not verified) */}
            {originalBciStatus !== 'Verified' && (
                <div className="bci-checkbox-wrapper" onClick={() => originalBciStatus !== 'Rejected' && setIsBciApplicant(!isBciApplicant)}>
                    <input
                        id="bci-applicant"
                        type="checkbox"
                        checked={isBciApplicant}
                        onChange={() => {}}
                        disabled={originalBciStatus === 'Rejected'} // Disable if rejected
                    />
                    <label htmlFor="bci-applicant">I am a Brain-Computer Interface recipient.</label>
                </div>
            )}

            {isBciApplicant && originalBciStatus !== 'Verified' && (
                <>
                    <p className="bci-notice">Please only select this if you have received a BCI implant.</p>
                    <div className="form-group">
                        <label htmlFor="bciCompany">BCI Provider Company</label>
                        <input
                            id="bciCompany"
                            type="text"
                            className="form-input"
                            value={bciCompany}
                            onChange={(e) => setBciCompany(e.target.value)}
                            placeholder="e.g., Neuralink"
                        />
                        <small className="form-text">The name of the company that provided your implant.</small>
                    </div>
                </>
            )}
        </div>

        <button type="submit" className="form-button">Update Profile</button>
      </form>
    </div>
  );
};

export default ProfilePage;