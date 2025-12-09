import React from 'react';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>The Future of Connection</h1>
        <p className="intro-text">
          Brain-Computer Interfaces (BCIs) represent the next frontier in human evolution.
          By bridging the gap between biological thought and digital action, we are opening doors
          that were previously locked for millions of individuals.
        </p>

        <section className="about-section">
          <h2>What is NeuroGridX?</h2>
          <p>
            NeuroGridX is an advanced web-platform designed to test and analyze BCI performance.
            It serves as a playground for researchers, patients, and enthusiasts to push the limits of
            precision control using neural inputs.
            This is a growing and expanding work in progress.
          </p>
        </section>

        <section className="about-section highlight">
          <h2>Telepathy is now Reality</h2>
          <p>
            Watch the presentation on how Neuralink and modern BCI technology are restoring autonomy.
          </p>
          <div className="video-container">
            <iframe
              src="https://www.youtube.com/embed/SEsqILe9rD0"
              title="BCI Presentation"
              style={
                { border: 'none' }
              }
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        <section className="about-section">
          <h2>About Neuralink</h2>
          <p>
            Pioneering the field, Neuralink's "Link" implant has demonstrated the ability to allow
            patients with quadriplegia to control computers with their minds alone.
          </p>
          <a href="https://neuralink.com" target="_blank" rel="noopener noreferrer" className="external-link">
            Visit Neuralink Official Site →
          </a>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;