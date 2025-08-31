const Event = require('../models/Event');
const User = require('../models/User');

// --- GET ALL EVENTS (Now with Search and Filter) ---
exports.getAllEvents = async (req, res) => {
  try {
    const { search, category } = req.query; // Get query params from URL
    let query = { status: 'active' }; // Base query

    if (search) {
      // Add search functionality (case-insensitive)
      query.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      // Add category filter
      query.category = category;
    }

    const events = await Event.find(query)
      .populate('organizer', 'name organizationName');
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ... (The rest of your controller functions remain the same) ...

exports.getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('organizer', 'name organizationName');
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAttendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user.id })
      .populate('organizer', 'name organizationName');
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const organizer = await User.findById(req.user.id);
    if (!organizer || organizer.role !== 'organizer') {
        return res.status(403).json({ message: 'Forbidden: Only organizers can create events.' });
    }
    if (organizer.verificationStatus !== 'verified') {
        return res.status(403).json({ message: 'Forbidden: Your organizer account is not verified yet.' });
    }
    const { title, description, date, location, isFree, price, imageUrl, category } = req.body;
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      isFree,
      price: isFree ? 0 : price,
      imageUrl,
      category,
      organizer: req.user.id,
    });
    const event = await newEvent.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name organizationName');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    event.attendees.push(req.user.id);
    await event.save();
    res.status(200).json({ message: 'Successfully registered for the event' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    event = await Event.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.cancelEvent = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'A reason for cancellation is required.' });
    }
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    event.status = 'cancelled';
    event.cancellationReason = reason;
    await event.save();
    res.status(200).json({ message: 'Event has been cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};