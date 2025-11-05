// Written as a sub-component of auth so it can be reused neatly between login and register and
// eventually password change

import React from 'react';
import './PasswordStrength.css';

interface PasswordStrengthProps {
  password?: string;
}

const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[!@#$%^&*(),.?":{}|<>]/)) strength++;
    return strength;
};

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  const strength = checkPasswordStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="strength-container">
      <div className="strength-bar">
        <div className={`strength-indicator strength-${strength}`}></div>
      </div>
      <span className="strength-label">{strength > 0 && strengthLabels[strength-1]}</span>
    </div>
  );
};
export default PasswordStrength;