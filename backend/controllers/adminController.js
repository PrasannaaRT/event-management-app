const User = require('../models/User');

// --- Get all pending organizers ---
exports.getPendingOrganizers = async (req, res) => {
  try {
    const pendingOrganizers = await User.find({
      role: 'organizer',
      verificationStatus: 'pending',
    }).select('-password'); // Exclude password from the result
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