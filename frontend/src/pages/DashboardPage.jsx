import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Modal from '../components/common/Modal';
import CancelEventModal from '../components/CancelEventModal';
import EventCard from '../components/EventCard'; // Import our new component

const DashboardPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancellingEventId, setCancellingEventId] = useState(null);
  const { token, user } = useContext(AuthContext);

  const fetchEvents = async () => {
    if (!token || !user) {
      setLoading(false);
      return;
    }
    const isOrganizer = user.role === 'organizer';
    const endpoint = isOrganizer ? '/api/events/my-events' : '/api/events/attending';
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.get(`http://localhost:5000${endpoint}`, config);
      setEvents(response.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token, user]);

  const openCancelModal = (eventId) => {
    setCancellingEventId(eventId);
    setIsModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancellingEventId(null);
    setIsModalOpen(false);
  };

  const handleConfirmCancellation = async (reason) => {
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      await axios.patch(
        `http://localhost:5000/api/events/${cancellingEventId}/cancel`, 
        { reason }, 
        config
      );
      fetchEvents();
      closeCancelModal();
    } catch (err) {
      console.error('Failed to cancel event', err);
      alert('Error: Could not cancel the event.');
    }
  };
  
  const CancelledEventCard = ({ event }) => (
    <div className="event-card cancelled-event" style={{ animationDelay: '0ms', opacity: 1 }}>
      <div className="event-card-content">
        <h3>{event.title} (Cancelled)</h3>
        <p><strong>Organizer:</strong> {event.organizer.organizationName}</p>
        <p className="cancellation-reason">
          <strong>Reason:</strong> {event.cancellationReason}
        </p>
      </div>
    </div>
  );

  if (loading) return <p>Loading your dashboard...</p>;

  return (
    <div className="fade-in">
      <header className="page-header">
        <h1>My Dashboard</h1>
      </header>
      
      {user && user.role === 'organizer' ? (
        // Organizer View
        <div>
          <Link to="/create-event" className="button-primary">Create New Event</Link>
          <h2>My Events</h2>
          {events.length === 0 ? (
            <p>You have not created any events yet.</p>
          ) : (
            <div className="event-list">
              {events.map((event, index) => (
                 event.status === 'cancelled' ? 
                 <CancelledEventCard key={event._id} event={event} /> :
                 <EventCard key={event._id} event={event} delay={`${index * 100}ms`}>
                    {/* These buttons are passed as children to the EventCard */}
                    <Link to={`/event/edit/${event._id}`} className="button-secondary">Edit</Link>
                    <button onClick={() => openCancelModal(event._id)} className="button-danger">Cancel Event</button>
                 </EventCard>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Regular User View
        <div>
          <h2>Events I'm Attending</h2>
          {events.length === 0 ? (
            <p>You have not registered for any events yet.</p>
          ) : (
            <div className="event-list">
              {events.map((event, index) => (
                event.status === 'cancelled' ?
                <CancelledEventCard key={event._id} event={event} /> :
                // The user's card is a link and has no children
                <EventCard key={event._id} event={event} delay={`${index * 100}ms`} />
              ))}
            </div>
          )}
        </div>
      )}
      
      <Modal isOpen={isModalOpen} onClose={closeCancelModal}>
        <CancelEventModal
          onCancel={closeCancelModal}
          onConfirm={handleConfirmCancellation}
        />
      </Modal>
    </div>
  );
};

export default DashboardPage;