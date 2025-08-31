import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event, delay, children }) => {
  const organizerName = event.organizer ? event.organizer.organizationName : 'Unknown Organizer';

  const cardContent = (
    <div className="event-card" style={{ animationDelay: delay }}>
      <div 
        className="event-card-image"
        style={{ backgroundImage: `url(${event.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'})` }}
      >
        <div className="event-card-tag">
          {event.isFree ? 'Free' : `₹${event.price}`}
        </div>
      </div>
      <div className="event-card-content">
        <h2>{event.title}</h2>
        <p className="organizer-name">by {organizerName}</p>
        
        <div className="event-card-details">
          <p>
            <span>🗓️</span>
            {new Date(event.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p>
            <span>📍</span>
            {event.location}
          </p>
        </div>
        {/* If action buttons are provided, they will render here */}
        {children && <div className="card-actions">{children}</div>}
      </div>
    </div>
  );

  // If there are no children (action buttons), make the whole card a link.
  // Otherwise, render it as a simple div.
  return children ? (
    <div className="event-card-link">{cardContent}</div>
  ) : (
    <Link to={`/event/${event._id}`} className="event-card-link">
      {cardContent}
    </Link>
  );
};

export default EventCard;