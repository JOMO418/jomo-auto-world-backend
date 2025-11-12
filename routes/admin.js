// routes/admin.js
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  getAllUsers,
  updateUser,
  getSalesReport
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const {
  paginationValidation,
  mongoIdValidation,
  handleValidationErrors
} = require('../utils/validation');

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Orders management
router.get(
  '/orders',
  paginationValidation,
  handleValidationErrors,
  getAllOrders
);

// Users management
router.get(
  '/users',
  paginationValidation,
  handleValidationErrors,
  getAllUsers
);

router.put(
  '/users/:id',
  mongoIdValidation,
  handleValidationErrors,
  updateUser
);

// Reports
router.get('/reports/sales', getSalesReport);

module.exports = router;