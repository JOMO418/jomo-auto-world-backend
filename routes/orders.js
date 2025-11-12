// routes/orders.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const {
  createOrderValidation,
  paginationValidation,
  mongoIdValidation,
  handleValidationErrors
} = require('../utils/validation');

// Protected routes
router.post(
  '/',
  protect,
  createOrderValidation,
  handleValidationErrors,
  createOrder
);

router.get(
  '/',
  protect,
  paginationValidation,
  handleValidationErrors,
  getMyOrders
);

router.get(
  '/:id',
  protect,
  mongoIdValidation,
  handleValidationErrors,
  getOrderById
);

router.put(
  '/:id/cancel',
  protect,
  mongoIdValidation,
  handleValidationErrors,
  cancelOrder
);

// Admin routes
router.put(
  '/:id/status',
  protect,
  admin,
  mongoIdValidation,
  handleValidationErrors,
  updateOrderStatus
);

module.exports = router;