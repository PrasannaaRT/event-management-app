import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import StarRating from '../components/common/StarRating'; // 1. Import our new component

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { user, token } = useContext(AuthContext);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchEventAndReviews = async () => {
      setLoading(true);
      try {
        const eventRes = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(eventRes.data);

        const reviewsRes = await axios.get(`http://localhost:5000/api/reviews/event/${id}`);
        setReviews(reviewsRes.data);

      } catch (err) {
        setError('Could not fetch event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEventAndReviews();
  }, [id]);

  const handleRegistration = async () => {
    setError('');
    setMessage('');
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      if (event.isFree) {
        const response = await axios.post(`http://localhost:5000/api/events/${id}/register`, {}, config);
        setMessage(response.data.message);
        setEvent({ ...event, attendees: [...event.attendees, user.id] });
      } else {
        const response = await axios.post('http://localhost:5000/api/checkout/create-session', { eventId: id }, config);
        window.location.href = response.data.url;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const body = { rating: newRating, comment: newComment };
      const res = await axios.post(`http://localhost:5000/api/reviews/event/${id}`, body, config);
      
      setReviews([res.data, ...reviews]);
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to submit review.');
    }
  };

  if (loading) return <p>Loading event...</p>;
  if (!event) return <p>Event not found.</p>;

  const isUserLoggedIn = !!user;
  const isOrganizer = isUserLoggedIn && user.id === event.organizer._id;
  const isAttendee = event.attendees.includes(user?.id);
  const hasUserReviewed = reviews.some(review => review.user?._id === user?.id);
  const isEventOver = new Date(event.date) < new Date();
  const canUserReview = isAttendee && isEventOver && !isOrganizer && !hasUserReviewed;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';

  return (
    <div className="fade-in">
      <img 
        src={event.imageUrl || 'https://via.placeholder.com/1200x400?text=Event+Banner'}
        alt={event.title}
        className="event-detail-banner"
      />
      <div className="event-detail-container">
        <h1>{event.title}</h1>
        <div className="event-meta">
          <span><strong>Average Rating:</strong> {averageRating} / 5 ⭐</span>
          <span><strong>Organized by:</strong> {event.organizer.organizationName}</span>
          <span><strong>Price:</strong> {event.isFree ? 'Free' : `₹${event.price}`}</span>
        </div>
        <p>{event.description}</p>
        
        {isUserLoggedIn && !isOrganizer && !isAttendee && (
          <button onClick={handleRegistration} className="button-primary">
            {event.isFree ? 'Register for this Event' : `Buy Ticket for ₹${event.price}`}
          </button>
        )}
        {isAttendee && <p className="success-message">You are registered for this event!</p>}
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        
        <hr className="divider" />

        <div className="reviews-section">
          <h2>Reviews ({reviews.length})</h2>
          
          {isAttendee && !isEventOver && !hasUserReviewed && (
             <p className="info-message">You can leave a review after the event has ended.</p>
          )}

          {canUserReview && (
            <form onSubmit={handleReviewSubmit} className="review-form">
              <h3>Leave a Review</h3>
              {/* 2. Replace the old input with our new component */}
              <StarRating rating={newRating} onRatingChange={setNewRating} />
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience..."
                required
              ></textarea>
              <button type="submit" className="button-primary">Submit Review</button>
            </form>
          )}

          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review._id} className="review-card">
                <p><strong>{review.user?.name || 'Anonymous'}</strong> - {review.rating} / 5 ⭐</p>
                <p>{review.comment}</p>
                <small>{new Date(review.createdAt).toLocaleDateString()}</small>
              </div>
            ))
          ) : (
            <p>No reviews yet. Be the first to leave one!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;