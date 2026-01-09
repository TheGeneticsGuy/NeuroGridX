import React, { useState, useEffect } from 'react';
import './CookieBanner.css';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Checking if the user has already acknowledged the banner
    const consent = localStorage.getItem('neurogrid-cookie-consent');
    if (!consent) {
      // Small delay to make it slide in nicely after the page loads
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Saving the consent flag
    localStorage.setItem('neurogrid-cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p>
          <strong>Privacy Notice:</strong> NeuroGridX only uses ESSENTIAL cookies for site functionality (authentication and settings). We do not track you or share your data with third parties.
        </p>
        <button onClick={handleAccept} className="cookie-btn">
          Got it
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;