// routes/payment.js
const express = require('express');
const router = express.Router();
const {
  initiateMpesaPayment,
  mpesaCallback,
  checkMpesaStatus,
  verifyPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// M-Pesa routes
router.post('/mpesa/initiate', protect, initiateMpesaPayment);
router.post('/mpesa/callback', mpesaCallback); // Public - M-Pesa will call this
router.get('/mpesa/status/:checkoutRequestId', protect, checkMpesaStatus);

// Admin payment verification
router.post('/verify', protect, admin, verifyPayment);

module.exports = router;