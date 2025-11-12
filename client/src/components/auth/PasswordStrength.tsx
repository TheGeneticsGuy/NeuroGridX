// Written as a sub-component of auth so it can be reused neatly between login and register and
// eventually password change

import React from 'react';
import './PasswordStrength.css';

interface PasswordStrengthProps {
  password?: string;
}

const rules = [
  { test: (pw: string) => pw.length >= 8, label: ' At least 8 characters' },
  { test: (pw: string) => /[a-z]/.test(pw), label: ' One lowercase letter' },
  { test: (pw: string) => /[A-Z]/.test(pw), label: ' One uppercase letter' },
  { test: (pw: string) => /\d/.test(pw), label: ' One number' },
  { test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw), label: ' One special character' },
];

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
  const metRulesCount = rules.filter(rule => rule.test(password)).length;
  const strength = checkPasswordStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthLabel = metRulesCount > 0 ? strengthLabels[metRulesCount - 1] : '';

  return (
    <div className="strength-container">
      <div className="strength-bar-wrapper">
        <div className="strength-bar">
          <div className={`strength-indicator strength-${strength}`}></div>
        </div>
        {/* Render the strength label */}
        <span className="strength-label">{strengthLabel}</span>
      </div>

      <ul className="rules-list">
        {rules.map((rule, index) => (
          <li key={index} className={rule.test(password) ? 'met' : 'unmet'}>
            <span className="rule-icon">{rule.test(password) ? '✔' : '✖'}</span>
            <span className="rule-label">{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;