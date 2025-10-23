const EventReview = require('../models/EventReview');
const OrganizerReview = require('../models/OrganizerReview');
const Event = require('../models/Event');
const User = require('../models/User');

// --- Create a new review for an EVENT ---
exports.createEventReview = async (req, res) => {
  const { rating, comment } = req.body;
  const eventId = req.params.id;
  const userId = req.user.id;
  try {
    const event = await Event.findById(eventId);
    if (!event) { return res.status(404).json({ msg: 'Event not found' }); }
    if (!event.attendees.includes(userId)) { return res.status(403).json({ msg: 'You can only review events you have attended' }); }
    const existingReview = await EventReview.findOne({ event: eventId, user: userId });
    if (existingReview) { return res.status(400).json({ msg: 'You have already reviewed this event' }); }
    
    const newReview = new EventReview({
      rating,
      comment,
      user: userId,
      event: eventId,
      organizer: event.organizer,
    });
    
    await newReview.save();
    const populatedReview = await EventReview.findById(newReview._id).populate('user', 'name');
    res.status(201).json(populatedReview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Create a new review for an ORGANIZER ---
exports.createOrganizerReview = async (req, res) => {
  const { rating, comment } = req.body;
  const organizerId = req.params.id;
  const userId = req.user.id;
  try {
    const organizer = await User.findById(organizerId);
    if (!organizer || organizer.role !== 'organizer') {
      return res.status(404).json({ msg: 'Organizer not found' });
    }
    const existingReview = await OrganizerReview.findOne({ organizer: organizerId, user: userId });
    if (existingReview) {
      return res.status(400).json({ msg: 'You have already reviewed this organizer' });
    }

    const newReview = new OrganizerReview({
      rating,
      comment,
      user: userId,
      organizer: organizerId,
    });

    await newReview.save();
    const populatedReview = await OrganizerReview.findById(newReview._id).populate('user', 'name');
    res.status(201).json(populatedReview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Get all EVENT reviews for a specific event ---
exports.getEventReviews = async (req, res) => {
  try {
    const reviews = await EventReview.find({ event: req.params.id }).populate('user', 'name');
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
3
// --- Get all ORGANIZER reviews for a specific organizer (This was the missing function) ---
exports.getOrganizerReviews = async (req, res) => {
  try {
    const reviews = await OrganizerReview.find({ organizer: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};