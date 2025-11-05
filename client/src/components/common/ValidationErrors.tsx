import React from 'react';
import './ValidationErrors.css';

interface ValidationErrorsProps {
  errors: string[];
}
// Reusable Error Component (similar to my EJS error reusable from WDD 340)
const ValidationErrors: React.FC<ValidationErrorsProps> = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="validation-errors-container">
      <ul>
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

export default ValidationErrors;