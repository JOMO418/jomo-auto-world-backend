// routes/products.js
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getBestSellers,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const {
  createProductValidation,
  updateProductValidation,
  paginationValidation,
  mongoIdValidation,
  handleValidationErrors
} = require('../utils/validation');

// Public routes
router.get('/', paginationValidation, handleValidationErrors, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/best-sellers', getBestSellers);
router.get('/search', searchProducts);
router.get('/:id', mongoIdValidation, handleValidationErrors, getProduct);

// Admin routes
router.post(
  '/',
  protect,
  isAdmin,
  uploadMultiple,
  createProductValidation,
  handleValidationErrors,
  createProduct
);

router.put(
  '/:id',
  protect,
  isAdmin,
  uploadMultiple,
  mongoIdValidation,
  updateProductValidation,
  handleValidationErrors,
  updateProduct
);

router.delete(
  '/:id',
  protect,
  isAdmin,
  mongoIdValidation,
  handleValidationErrors,
  deleteProduct
);

module.exports = router;