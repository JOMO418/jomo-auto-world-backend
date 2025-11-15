// routes/admin.js
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getRecentActivity,
  getLowStockProducts,
  getAdminProducts,
  toggleProductVisibility
} = require('../controllers/adminController');
const {
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const {
  createProductValidation,
  updateProductValidation,
  mongoIdValidation,
  handleValidationErrors
} = require('../utils/validation');

// Apply auth middleware to all admin routes
router.use(protect, isAdmin);

// ========== DASHBOARD ==========
// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', getDashboardStats);

// GET /api/admin/recent-activity
router.get('/recent-activity', getRecentActivity);

// ========== PRODUCTS ==========
// GET /api/admin/products (includes hidden/inactive)
router.get('/products', getAdminProducts);

// GET /api/admin/products/low-stock
router.get('/products/low-stock', getLowStockProducts);

// POST /api/admin/products
router.post(
  '/products', 
  /* uploadMultiple,
  createProductValidation,
  handleValidationErrors,*/
  createProduct
);

// PUT /api/admin/products/:id
router.put(
  '/products/:id',
  uploadMultiple,
  mongoIdValidation,
  updateProductValidation,
  handleValidationErrors,
  updateProduct
);

// DELETE /api/admin/products/:id
router.delete(
  '/products/:id',
  mongoIdValidation,
  handleValidationErrors,
  deleteProduct
);

// PATCH /api/admin/products/:id/visibility
router.patch(
  '/products/:id/visibility',
  mongoIdValidation,
  handleValidationErrors,
  toggleProductVisibility
);

// ========== ORDERS ==========
// GET /api/admin/orders
router.get('/orders', getAllOrders);

// PATCH /api/admin/orders/:id/status
router.patch(
  '/orders/:id/status',
  mongoIdValidation,
  handleValidationErrors,
  updateOrderStatus
);

module.exports = router;