import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { tamilNaduLocations } from '../utils/locations'; // Import the locations array

const CreateEventPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: tamilNaduLocations[0], // UPDATED: Default to the first location
    isFree: true,
    price: 0,
    imageUrl: '',
    galleryImageUrls: [], // Initializing as an empty array is good
    category: 'Other',
  });
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // THE FIX IS HERE: Replace these placeholder values
  // Make sure these are YOUR actual Cloudinary credentials, not placeholders
  const CLOUDINARY_CLOUD_NAME = 'dzocx8jnu'; // Your actual Cloudinary cloud name
  const CLOUDINARY_UPLOAD_PRESET = 'eventhub_preset'; // Your actual Cloudinary upload preset

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(''); // Clear previous errors
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      // Check if credentials are placeholders (This check is still useful)
      if (CLOUDINARY_CLOUD_NAME === 'your_cloud_name_here' || CLOUDINARY_UPLOAD_PRESET === 'your_upload_preset_here') {
        throw new Error("Cloudinary credentials are not configured correctly.");
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
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
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
      // formData now includes the selected location
      await axios.post('http://localhost:5000/api/events', formData, config);
      navigate('/dashboard'); // Or navigate to event detail page, or /my-events
    } catch (err) {
      console.error("Event creation submission error:", err); // More specific error logging
      const errorMessage = err.response ? err.response.data.message : 'Event creation failed.';
      setError(errorMessage);
    }
  };

  const categories = ['Music', 'Tech', 'Art', 'Food & Drink', 'Sports', 'Other'];

  return (
    <div className="form-container">
      <h1>Create a New Event</h1>
      <form onSubmit={onSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <input type="text" name="title" value={formData.title} onChange={onChange} placeholder="Event Title" required />
        <textarea name="description" value={formData.description} onChange={onChange} placeholder="Event Description" required rows="5" /> {/* Added rows for better UX */}
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

        <div className="role-selector"> {/* Consider renaming this class to something more generic like 'checkbox-group' */}
          <label>
            <input type="checkbox" name="isFree" checked={formData.isFree} onChange={onChange} /> This event is free
          </label>
        </div>

        {!formData.isFree && (
          <input type="number" name="price" value={formData.price} onChange={onChange} placeholder="Ticket Price (INR)" required min="1" />
        )}

        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEventPage;