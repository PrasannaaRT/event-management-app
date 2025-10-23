const User = require('../models/User');
const Event = require('../models/Event');
const OrganizerReview = require('../models/OrganizerReview'); // Use the new model

// ... (getOrganizerProfile and getOrganizerEvents functions remain the same) ...

// --- Get all reviews for a specific organizer ---
exports.getOrganizerReviews = async (req, res) => {
  try {
    // Fetch from the OrganizerReview collection
    const reviews = await OrganizerReview.find({ organizer: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getOrganizerProfile = async (req, res) => {
  try {
    const organizer = await User.findById(req.params.id).select('-password');
    if (!organizer || organizer.role !== 'organizer') {
      return res.status(404).json({ msg: 'Organizer not found' });
    }
    res.json(organizer);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.params.id, status: 'active' })
      .sort({ date: -1 });
    const upcomingEvents = events.filter(event => new Date(event.date) >= new Date());
    const pastEvents = events.filter(event => new Date(event.date) < new Date());
    res.json({ upcomingEvents, pastEvents });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};