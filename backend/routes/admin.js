const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getPendingOrganizers, approveOrganizer, rejectOrganizer } = require('../controllers/adminController');

// Middleware to check if user is an admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }
  next();
};

// @route   GET /api/admin/pending-organizers
// @desc    Get all organizers pending verification
// @access  Private (Admin)
router.get('/pending-organizers', authMiddleware, adminMiddleware, getPendingOrganizers);

// @route   PATCH /api/admin/organizers/:id/approve
// @desc    Approve an organizer
// @access  Private (Admin)
router.patch('/organizers/:id/approve', authMiddleware, adminMiddleware, approveOrganizer);

// @route   PATCH /api/admin/organizers/:id/reject
// @desc    Reject an organizer
// @access  Private (Admin)
router.patch('/organizers/:id/reject', authMiddleware, adminMiddleware, rejectOrganizer);

module.exports = router;