import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} | <a
            href="https://github.com/TheGeneticsGuy/NeuroGridX"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >NeuroGridX</a></p>
      <p>By Aaron Topping | All Rights Reserved</p>
    </footer>
  );
};

export default Footer;