const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'organizer', 'admin'],
    default: 'user',
  },
  // --- ADDED LOCATION FIELD ---
  location: { 
    type: String, 
    enum: [
      'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli (Trichy)', 'Salem', 
      'Tirunelveli', 'Vellore', 'Thoothukudi (Tuticorin)', 'Erode', 'Thanjavur', 
      'Dindigul', 'Nagercoil', 'Kancheepuram'
    ], 
    required: true // Making location mandatory for all users
  },
  // --- END ADDED LOCATION FIELD ---
  organizationName: {
    type: String,
    // Only required if the role is 'organizer'
    required: function() { return this.role === 'organizer'; } 
  },
  bio: { 
    type: String, 
    default: '' 
  },
  website: { 
    type: String, 
    default: '' 
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    // Default applies mainly to organizers upon creation
    default: function() { return this.role === 'organizer' ? 'pending' : 'verified'; } 
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);