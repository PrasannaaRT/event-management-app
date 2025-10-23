const User = require('../models/User');
const Event = require('../models/Event');

// --- Get all pending organizers ---
exports.getPendingOrganizers = async (req, res) => {
  try {
    const pendingOrganizers = await User.find({
      role: 'organizer',
      verificationStatus: 'pending',
    }).select('-password');
    res.json(pendingOrganizers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Approve an organizer ---
exports.approveOrganizer = async (req, res) => {
  try {
    const organizer = await User.findById(req.params.id);
    if (!organizer || organizer.role !== 'organizer') {
      return res.status(404).json({ msg: 'Organizer not found' });
    }
    organizer.verificationStatus = 'verified';
    await organizer.save();
    res.json({ msg: 'Organizer approved' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Reject an organizer ---
exports.rejectOrganizer = async (req, res) => {
  try {
    const organizer = await User.findById(req.params.id);
    if (!organizer || organizer.role !== 'organizer') {
      return res.status(404).json({ msg: 'Organizer not found' });
    }
    organizer.verificationStatus = 'rejected';
    await organizer.save();
    res.json({ msg: 'Organizer rejected' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Get platform statistics ---
exports.getStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    res.json({ totalEvents, activeEvents, totalUsers });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Get all events with their attendees ---
exports.getEventsWithAttendees = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'organizationName')
      .populate('attendees', 'name email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Get registration analytics (for line chart) ---
exports.getRegistrationAnalytics = async (req, res) => {
  try {
    const registrations = await Event.aggregate([
      { $unwind: '$attendees' },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(registrations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Get category distribution (for pie chart) ---
exports.getCategoryDistribution = async (req, res) => {
  try {
    const categories = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- Get revenue analytics (for bar chart) ---
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const revenue = await Event.aggregate([
      { $match: { isFree: false, status: 'active' } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: { $multiply: ["$price", { $size: "$attendees" }] } } 
        } 
      }
    ]);
    res.json(revenue[0] || { totalRevenue: 0 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};