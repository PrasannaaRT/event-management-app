import React from 'react';

const AboutPage = () => {
  return (
    <div className="fade-in">
      <header className="page-header">
        <h1>About EventHub</h1>
      </header>
      <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
        <p>
          Welcome to EventHub, your central place for discovering and managing events. Our mission is to bridge the gap between event organizers and attendees, creating a seamless experience for everyone.
        </p>
        <p>
          For organizers, we provide a simple and powerful platform to post, manage, and promote your events to a wide audience. For attendees, we offer a curated, easy-to-navigate directory of exciting events happening around you.
        </p>
        <p>
          This project was built as a demonstration of a modern, full-stack web application using the MERN (MongoDB, Express, React, Node.js) stack.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;