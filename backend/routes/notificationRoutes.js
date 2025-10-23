// backend/routes/notificationRoutes.js (CLEANED UP VERSION)
const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware'); // Correct import for 'protect'

router.get('/', protect, getUserNotifications);
router.patch('/:id/read', protect, markNotificationAsRead);
router.get('/unread-count', protect, getUnreadNotificationCount);

module.exports = router;