import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './NotificationsPage.css'; // You'll need to create this CSS file

const NotificationsPage = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const fetchNotifications = async () => {
    if (!token) {
      setError('You must be logged in to view notifications.');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.get('http://localhost:5000/api/notifications', config);
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]); // Re-fetch if token changes

  const markAsRead = async (id) => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, config);

      // Update the state to reflect the change
      setNotifications(notifications.map(notif =>
        notif._id === id ? { ...notif, isRead: true } : notif
      ));
      setMessage('Notification marked as read.');
      // Clear message after a few seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err.response?.data?.message || 'Failed to mark notification as read.');
    }
  };

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="notifications-page fade-in">
      <h1>Your Notifications</h1>
      {message && <p className="success-message">{message}</p>}

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                <p className="notification-message">
                  {notification.message}
                </p>
                {notification.eventId && (
                  <p className="notification-event-link">
                    Event: <Link to={`/events/${notification.eventId._id}`}>{notification.eventId.title}</Link>
                  </p>
                )}
                <small className="notification-date">
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="mark-read-button"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;