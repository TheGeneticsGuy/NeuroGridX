import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} | NeuroGridX</p>
      <p>By Aaron Topping | All Rights Reserved</p>
    </footer>
  );
};

export default Footer;