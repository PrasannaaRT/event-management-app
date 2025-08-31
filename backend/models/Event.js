const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
  galleryImageUrls: [{ type: String }],
  category: { // Add this new field
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