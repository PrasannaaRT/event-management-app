// backend/routes/events.js
const express = require('express');
const router = express.Router();

// --- THE FIX IS HERE ---
// Change this line:
// const authMiddleware = require('../middleware/authMiddleware');
// To this:
const { protect } = require('../middleware/authMiddleware'); // Import protect as a named export
// --- END FIX ---

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  cancelEvent, // Renamed from deleteEvent for clarity
  getMyEvents,
  registerForEvent,
  getAttendingEvents,
  getFeaturedEvents
} = require('../controllers/eventController');

// This must come before any routes with /:id
router.get('/featured', getFeaturedEvents);
router.get('/my-events', protect, getMyEvents); // Use 'protect' directly
router.get('/attending', protect, getAttendingEvents); // Use 'protect' directly

router.post('/', protect, createEvent); // Use 'protect' directly

router.get('/', getAllEvents);

router.get('/:id', getEventById);

router.post('/:id/register', protect, registerForEvent); // Use 'protect' directly

router.put('/:id', protect, updateEvent); // Use 'protect' directly

// THE FIX: Changed from DELETE to PATCH for cancelling an event
router.patch('/:id/cancel', protect, cancelEvent); // Use 'protect' directly

module.exports = router;