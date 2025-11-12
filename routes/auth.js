// routes/auth.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  handleValidationErrors
} = require('../utils/validation');

// Public routes
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidation, handleValidationErrors, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;