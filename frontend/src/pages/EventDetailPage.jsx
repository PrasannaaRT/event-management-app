import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  // ... (rest of the state and functions remain the same)
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        setError('Could not fetch event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegistration = async () => {
    // ... (this function remains the same)
    setError('');
    setMessage('');
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      if (event.isFree) {
        const response = await axios.post(`http://localhost:5000/api/events/${id}/register`, {}, config);
        setMessage(response.data.message);
      } else {
        const response = await axios.post('http://localhost:5000/api/checkout/create-session', { eventId: id }, config);
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };


  if (loading) return <p>Loading event...</p>;
  if (!event) return <p>Event not found.</p>;

  const isUserLoggedIn = !!user;
  const isOrganizer = isUserLoggedIn && user.id === event.organizer._id;
  const isAlreadyRegistered = event.attendees.includes(user?.id);

  return (
    <div className="fade-in">
      <img 
        src={event.imageUrl || 'https://via.placeholder.com/1200x400?text=Event+Banner'}
        alt={event.title}
        className="event-detail-banner"
      />
      <div className="event-detail-container">
        <h1>{event.title}</h1>
        <p><strong>Organized by:</strong> {event.organizer.organizationName}</p>
        <p><strong>Price:</strong> {event.isFree ? 'Free' : `₹${event.price}`}</p>
        <p>{event.description}</p>

        {isUserLoggedIn && !isOrganizer && !isAlreadyRegistered && (
          <button onClick={handleRegistration} className="button-primary">
            {event.isFree ? 'Register for this Event' : `Buy Ticket for ₹${event.price}`}
          </button>
        )}
        {/* ... (rest of the component) */}
         {isAlreadyRegistered && <p style={{ color: 'green', marginTop: '1rem' }}>You are already registered for this event!</p>}
        {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </div>
    </div>
  );
};

export default EventDetailPage;