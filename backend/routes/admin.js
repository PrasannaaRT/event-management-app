// backend/routes/admin.js
const express = require('express');
const router = express.Router();

// --- THE FIX IS HERE ---
// Change this line:
// const authMiddleware = require('../middleware/authMiddleware');
// To this:
const { protect } = require('../middleware/authMiddleware'); // Import protect as a named export
// --- END FIX ---

const {
  getPendingOrganizers,
  approveOrganizer,
  rejectOrganizer,
  getStats,
  getEventsWithAttendees,
  getRegistrationAnalytics,
  getCategoryDistribution,
  getRevenueAnalytics
} = require('../controllers/adminController');

// Middleware to check if user is an admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }
  next();
};

// Routes for organizer verification (Now using 'protect')
router.get('/pending-organizers', protect, adminMiddleware, getPendingOrganizers);
router.patch('/organizers/:id/approve', protect, adminMiddleware, approveOrganizer);
router.patch('/organizers/:id/reject', protect, adminMiddleware, rejectOrganizer);

// Routes for stats and attendee lists (Now using 'protect')
router.get('/stats', protect, adminMiddleware, getStats);
router.get('/events-with-attendees', protect, adminMiddleware, getEventsWithAttendees);

// Routes for graphical analytics (Now using 'protect')
router.get('/analytics/registrations', protect, adminMiddleware, getRegistrationAnalytics);
router.get('/analytics/categories', protect, adminMiddleware, getCategoryDistribution);
router.get('/analytics/revenue', protect, adminMiddleware, getRevenueAnalytics);

module.exports = router;