const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createCheckoutSession, handleWebhook } = require('../controllers/checkoutController');

// This route needs to use express.raw for the webhook signature to be verified
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// All other routes in this file will now use the json parser from server.js
router.use(express.json());

router.post('/create-session', authMiddleware, createCheckoutSession);

module.exports = router;