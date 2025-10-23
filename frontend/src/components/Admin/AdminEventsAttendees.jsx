import React, { useState } from 'react';

const AdminEventsAttendees = ({ events, loading, error }) => {
  const [activeEventId, setActiveEventId] = useState(null);

  const toggleEvent = (eventId) => {
    setActiveEventId(activeEventId === eventId ? null : eventId);
  };

  if (loading) return <p>Loading event and attendee data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="admin-section fade-in">
      <h2>Event Attendee Details</h2>
      <div className="accordion">
        {events.map((event) => (
          <div key={event._id} className="accordion-item">
            <button className="accordion-title" onClick={() => toggleEvent(event._id)}>
              <span>{event.title} by {event.organizer?.organizationName || 'N/A'}</span>
              <span>{activeEventId === event._id ? '−' : '+'}</span>
            </button>
            {activeEventId === event._id && (
              <div className="accordion-content">
                {event.attendees.length > 0 ? (
                  <table className="attendee-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th></tr>
                    </thead>
                    <tbody>
                      {event.attendees.map(attendee => (
                        <tr key={attendee._id}>
                          <td>{attendee.name}</td>
                          <td>{attendee.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No attendees have registered for this event yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEventsAttendees;