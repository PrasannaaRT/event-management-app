const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
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
router.get('/my-events', authMiddleware, getMyEvents);
router.get('/attending', authMiddleware, getAttendingEvents);

router.post('/', authMiddleware, createEvent);

router.get('/', getAllEvents);

router.get('/:id', getEventById);

router.post('/:id/register', authMiddleware, registerForEvent);

router.put('/:id', authMiddleware, updateEvent);

// THE FIX: Changed from DELETE to PATCH for cancelling an event
router.patch('/:id/cancel', authMiddleware, cancelEvent);

module.exports = router;