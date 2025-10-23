// backend/routes/reviews.js
const express = require('express');
const router = express.Router();

// --- THE FIX IS HERE ---
// Change this line:
// const authMiddleware = require('../middleware/authMiddleware');
// To this:
const { protect } = require('../middleware/authMiddleware'); // Import protect as a named export
// --- END FIX ---

const {
  createEventReview,
  getEventReviews,
  createOrganizerReview,
  getOrganizerReviews
} = require('../controllers/reviewController');

// == Event Review Routes ==
router.post('/event/:id', protect, createEventReview); // Use 'protect' directly
router.get('/event/:id', getEventReviews); // This route doesn't need protection

// == Organizer Review Routes ==
router.post('/organizer/:id', protect, createOrganizerReview); // Use 'protect' directly
router.get('/organizer/:id', getOrganizerReviews); // This route doesn't need protection

module.exports = router;