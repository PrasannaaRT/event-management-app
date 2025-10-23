const express = require('express');
const router = express.Router();
const { 
  getOrganizerProfile, 
  getOrganizerEvents, 
  getOrganizerReviews 
} = require('../controllers/organizerController');

// @route   GET /api/organizers/:id
// @desc    Get an organizer's public profile
// @access  Public
router.get('/:id', getOrganizerProfile);

// @route   GET /api/organizers/:id/events
// @desc    Get all events by an organizer
// @access  Public
router.get('/:id/events', getOrganizerEvents);

// @route   GET /api/organizers/:id/reviews
// @desc    Get all reviews for an organizer's events
// @access  Public
router.get('/:id/reviews', getOrganizerReviews);

module.exports = router;