import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css'; // Imports the dedicated CSS file
import EventCard from '../components/EventCard'; // Use our stylish EventCard component

const AnimatedBackground = () => {
  const shapes = useMemo(() => {
    const newShapes = [];
    const colors = ['#6a5acd', '#f08080', '#20b2aa', '#ffa500'];
    const numShapes = 15;

    for (let i = 0; i < numShapes; i++) {
      newShapes.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 120 + 20}px`,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: `${Math.random() * 15 + 20}s`,
        delay: `${Math.random() * 10}s`,
      });
    }
    return newShapes;
  }, []);

  return (
    <div className="animation-wrapper">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="shape"
          style={{
            top: shape.top,
            left: shape.left,
            width: shape.size,
            height: shape.size,
            backgroundColor: shape.color,
            boxShadow: `0 0 20px ${shape.color}`,
            animationDuration: shape.duration,
            animationDelay: shape.delay,
          }}
        />
      ))}
    </div>
  );
};

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events/featured');
        setFeaturedEvents(response.data);
      } catch (err) {
        console.error('Failed to fetch featured events', err);
      }
    };
    fetchFeaturedEvents();
  }, []);

  return (
    <div className="fade-in">
      <AnimatedBackground />
      <div className="hero">
        <h1>Find Your Next Experience</h1>
        <p>Discover, register for, and manage amazing events all in one place. Your adventure starts here.</p>
        <Link to="/events" className="button-primary">Browse All Events</Link>
      </div>

      <section className="homepage-section">
        <h2 className="section-title">Featured Events</h2>
        <div className="event-list">
          {featuredEvents.length > 0 ? (
            featuredEvents.map((event, index) => (
              <EventCard 
                key={event._id} 
                event={event} 
                delay={`${index * 100}ms`} 
              />
            ))
          ) : (
            <p>No featured events available right now.</p>
          )}
        </div>
      </section>

      <section className="homepage-section how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-icon">🔍</div>
            <h3>Discover</h3>
            <p>Browse a wide variety of events from trusted organizers.</p>
          </div>
          <div className="step">
            <div className="step-icon">🎟️</div>
            <h3>Register</h3>
            <p>Sign up for events you want to attend with a single click.</p>
          </div>
          <div className="step">
            <div className="step-icon">🎉</div>
            <h3>Enjoy</h3>
            <p>Attend your event and have a great time. It's that simple!</p>
          </div>
        </div>
      </section>

      <section className="homepage-section cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join our community of organizers and attendees today.</p>
        <Link to="/register" className="button-primary">Sign Up Now</Link>
      </section>
    </div>
  );
};

export default HomePage;