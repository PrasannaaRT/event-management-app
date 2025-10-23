// backend/routes/checkout.js
const express = require('express');
const router = express.Router();

// --- THE FIX IS HERE ---
// Change this line:
// const authMiddleware = require('../middleware/authMiddleware');
// To this:
const { protect } = require('../middleware/authMiddleware'); // Import protect as a named export
// --- END FIX ---

const { createCheckoutSession, handleWebhook } = require('../controllers/checkoutController');

// This route needs to use express.raw for the webhook signature to be verified
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// All other routes in this file will now use the json parser from server.js
// Important: Place express.json() after the raw parser for webhook if that's first
// Or, if this applies to all *other* routes, it's fine.
// Ensure your main server.js has app.use(express.json()) *before* router mounts for general parsing.
// If you want json parsing specific to routes AFTER webhook in this file,
// router.use(express.json()); is correct.
router.use(express.json()); 


router.post('/create-session', protect, createCheckoutSession); // Use 'protect' directly

module.exports = router;