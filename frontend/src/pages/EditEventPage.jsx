import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { tamilNaduLocations } from '../utils/locations'; // Import the locations array

const EditEventPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '', // Will be set by fetched event data
    isFree: true,
    price: 0,
    imageUrl: '',
    galleryImageUrls: [], // Ensure this is handled if your backend sends it
    category: 'Other',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // IMPORTANT: Replace with your Cloudinary details if you haven't already
  const CLOUDINARY_CLOUD_NAME = 'dzocx8jnu'; // Your actual Cloudinary cloud name
  const CLOUDINARY_UPLOAD_PRESET = 'eventhub_preset'; // Your actual Cloudinary upload preset

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        const eventData = response.data;

        // Format the date correctly for the datetime-local input
        const formattedDate = eventData.date ? new Date(eventData.date).toISOString().slice(0, 16) : '';

        // Ensure location is valid, default if not
        const validLocation = tamilNaduLocations.includes(eventData.location) 
                              ? eventData.location 
                              : tamilNaduLocations[0]; // Default to first if existing is invalid/missing

        setFormData({
          ...eventData,
          date: formattedDate,
          location: validLocation, // Set the fetched (and validated) location
          // Ensure galleryImageUrls is an array, if it exists
          galleryImageUrls: eventData.galleryImageUrls || [],
        });
      } catch (err) {
        console.error("Error fetching event data for edit:", err);
        setError('Failed to load event data. Please ensure the event ID is correct and you have permission.');
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      if (CLOUDINARY_CLOUD_NAME === 'your_cloud_name_here' || CLOUDINARY_UPLOAD_PRESET === 'your_upload_preset_here') {
        throw new Error("Cloudinary credentials are not configured.");
      }
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        uploadFormData
      );
      setFormData({ ...formData, imageUrl: response.data.secure_url });
    } catch (err) {
      console.error("Cloudinary upload error:", err); // More specific error logging
      setError('Image upload failed. Please check your Cloudinary credentials and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) {
      setError('Please wait for the image to finish uploading.');
      return;
    }
    setError('');

    // Client-side validation for price if not free
    if (!formData.isFree && (formData.price <= 0 || !formData.price)) {
      setError('Price must be a positive number for paid events.');
      return;
    }

    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/events/${id}`, formData, config);
      navigate('/dashboard'); // Or navigate to the updated event's detail page
    } catch (err) {
      console.error("Event update submission error:", err); // More specific error logging
      const errorMessage = err.response ? err.response.data.message : 'Event update failed.';
      setError(errorMessage);
    }
  };

  if (loading) return <p>Loading event data...</p>;

  const categories = ['Music', 'Tech', 'Art', 'Food & Drink', 'Sports', 'Other'];

  return (
    <div className="form-container fade-in">
      <h1>Edit Your Event</h1>
      <form onSubmit={onSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input type="text" name="title" value={formData.title} onChange={onChange} placeholder="Event Title" required />
        <textarea name="description" value={formData.description} onChange={onChange} placeholder="Event Description" required rows="5" /> {/* Added rows */}
        <input type="datetime-local" name="date" value={formData.date} onChange={onChange} required />

        {/* --- REPLACED LOCATION INPUT WITH DROPDOWN --- */}
        <div className="form-group">
          <label htmlFor="location">Event Location:</label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={onChange}
            required
          >
            {tamilNaduLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        {/* --- END LOCATION DROPDOWN --- */}

        <div className="form-group">
          <label htmlFor="category">Event Category:</label>
          <select id="category" name="category" value={formData.category} onChange={onChange}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Main Event Image</label>
          <input type="file" onChange={handleFileChange} accept="image/*" /> {/* Added accept attribute */}
          {isUploading && <p>Uploading image...</p>}
          {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" style={{ width: '100px', marginTop: '10px', borderRadius: '4px' }} />}
        </div>

        <div className="role-selector">
          <label>
            <input type="checkbox" name="isFree" checked={formData.isFree} onChange={onChange} /> This event is free
          </label>
        </div>
        
        {!formData.isFree && (
          <input type="number" name="price" value={formData.price} onChange={onChange} placeholder="Ticket Price (INR)" required min="1" />
        )}
        
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditEventPage;