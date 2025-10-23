import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import { tamilNaduLocations } from '../utils/locations'; // Import locations for filter

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for search and filter controls
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All'); // ADDED: State for location filter

  // This effect now re-runs whenever search term, category, or location changes
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null); // Clear previous errors on a new fetch
      try {
        // Pass search, category, AND location as query params to the API
        const response = await axios.get(`http://localhost:5000/api/events`, {
          params: {
            search: searchTerm,
            category: category,
            location: selectedLocation !== 'All' ? selectedLocation : '', // Only send if not 'All'
          },
        });
        setEvents(response.data);
      } catch (err) {
        console.error("Error fetching events:", err); // Improved error logging
        setError('Failed to fetch events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // This timeout prevents the API from being called on every single keystroke
    const timerId = setTimeout(() => {
      fetchEvents();
    }, 500);

    // This cleanup function cancels the timer if the user keeps typing or changes filters
    return () => clearTimeout(timerId);

  }, [searchTerm, category, selectedLocation]); // ADDED: selectedLocation to dependency array

  const categories = ['All', 'Music', 'Tech', 'Art', 'Food & Drink', 'Sports', 'Other'];
  const locations = ['All', ...tamilNaduLocations]; // Combine 'All' with actual locations

  // Your preferred loading and error handling structure
  if (loading) return <p>Loading events...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="fade-in">
      <header className="page-header">
        <h1>Browse All Events</h1>
      </header>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by event title..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        {/* --- ADDED LOCATION FILTER DROPDOWN --- */}
        <select
          className="location-select" // Assign a class for styling
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        {/* --- END LOCATION FILTER DROPDOWN --- */}

      </div>

      <div className="event-list">
        {events.length > 0 ? (
          events.map((event, index) => (
            <EventCard
              key={event._id}
              event={event}
              delay={`${index * 100}ms`}
            />
          ))
        ) : (
          <p>No events found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default EventsPage;