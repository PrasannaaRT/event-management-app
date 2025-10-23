import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import EventCard from '../components/EventCard';
import { AuthContext } from '../context/AuthContext';
import StarRating from '../components/common/StarRating';

const OrganizerProfilePage = () => {
  const { id } = useParams();
  const [organizer, setOrganizer] = useState(null);
  const [events, setEvents] = useState({ upcomingEvents: [], pastEvents: [] });
  const [organizerReviews, setOrganizerReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(AuthContext);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchOrganizerData = async () => {
      try {
        const [profileRes, eventsRes, orgReviewsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/organizers/${id}`),
          axios.get(`http://localhost:5000/api/organizers/${id}/events`),
          axios.get(`http://localhost:5000/api/reviews/organizer/${id}`)
        ]);
        
        setOrganizer(profileRes.data);
        setEvents(eventsRes.data);
        setOrganizerReviews(orgReviewsRes.data);

      } catch (err) {
        console.error("Failed to fetch organizer data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizerData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      // THE FIX: The request body should ONLY contain the rating and comment.
      const body = { 
        rating: newRating, 
        comment: newComment
      };
      const res = await axios.post(`http://localhost:5000/api/reviews/organizer/${id}`, body, config);
      
      setOrganizerReviews([res.data, ...organizerReviews]);
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to submit review.');
    }
  };

  if (loading) return <p>Loading organizer profile...</p>;
  if (!organizer) return <p>Organizer not found.</p>;

  const averageRating = organizerReviews.length > 0
    ? (organizerReviews.reduce((acc, review) => acc + review.rating, 0) / organizerReviews.length).toFixed(1)
    : 'No ratings yet';

  const hasUserReviewed = organizerReviews.some(review => review.user?._id === user?.id);
  const canUserReview = user && user.id !== organizer._id && !hasUserReviewed;

  return (
    <div className="fade-in">
      <header className="organizer-profile-header">
        <h1>{organizer.organizationName}</h1>
        <div className="organizer-stats">
          <span>⭐ {averageRating} Average Rating</span>
          <span>💬 {organizerReviews.length} Organizer Reviews</span>
        </div>
        <p className="organizer-bio">{organizer.bio || 'This organizer has not yet provided a bio.'}</p>
        {organizer.website && <a href={organizer.website} target="_blank" rel="noopener noreferrer" className="button-secondary">Visit Website</a>}
      </header>

      {canUserReview && (
        <form onSubmit={handleReviewSubmit} className="review-form">
          <h3>Leave a Review for {organizer.organizationName}</h3>
          <StarRating rating={newRating} onRatingChange={setNewRating} />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Share your overall experience with this organizer...`}
            required
          ></textarea>
          <button type="submit" className="button-primary">Submit Organizer Review</button>
        </form>
      )}

      <div className="organizer-content">
        <h2 className="section-title">Upcoming Events</h2>
        <div className="event-list">
          {events.upcomingEvents.length > 0 ? (
            events.upcomingEvents.map((event, index) => <EventCard key={event._id} event={event} delay={`${index * 100}ms`} />)
          ) : (
            <p>This organizer has no upcoming events.</p>
          )}
        </div>

        <hr className="divider" />
        
        <h2 className="section-title">Past Events</h2>
        <div className="event-list">
          {events.pastEvents.length > 0 ? (
            events.pastEvents.map((event, index) => <EventCard key={event._id} event={event} delay={`${index * 100}ms`} />)
          ) : (
            <p>This organizer has no past events listed.</p>
          )}
        </div>
        
        <hr className="divider" />

        <h2 className="section-title">General Organizer Reviews</h2>
        <div className="reviews-section">
          {organizerReviews.length > 0 ? (
            organizerReviews.map(review => (
              <div key={review._id} className="review-card">
                 <p><strong>{review.user?.name || 'Anonymous'}</strong> - {review.rating} / 5 ⭐</p>
                 <p>"{review.comment}"</p>
                 <small>{new Date(review.createdAt).toLocaleDateString()}</small>
              </div>
            ))
          ) : (
            <p>This organizer has not received any general reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfilePage;