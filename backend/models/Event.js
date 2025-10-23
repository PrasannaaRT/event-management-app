const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  // --- UPDATED LOCATION FIELD ---
  location: { 
    type: String, 
    enum: [
      'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli (Trichy)', 'Salem', 
      'Tirunelveli', 'Vellore', 'Thoothukudi (Tuticorin)', 'Erode', 'Thanjavur', 
      'Dindigul', 'Nagercoil', 'Kancheepuram'
    ], 
    required: true // Event must have a location
  },
  // --- END UPDATED LOCATION FIELD ---
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
  galleryImageUrls: [{ type: String }],
  category: {
    type: String,
    enum: ['Music', 'Tech', 'Art', 'Food & Drink', 'Sports', 'Other'],
    default: 'Other',
  },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active',
  },
  cancellationReason: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);