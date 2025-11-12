// utils/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

// User validation rules
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^(\+254|0)[17]\d{8}$/).withMessage('Please provide a valid Kenyan phone number (e.g., +254712345678 or 0712345678)')
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

exports.updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters'),
  
  body('phone')
    .optional()
    .matches(/^(\+254|0)[17]\d{8}$/).withMessage('Please provide a valid Kenyan phone number')
];

// Product validation rules
exports.createProductValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('brand')
    .notEmpty().withMessage('Brand is required')
    .isIn(['Bosch', 'NGK', 'KYB', 'Denso', 'Brembo', 'Sachs', 'Monroe', 'Genuine', 'OEM', 'Mann Filter', 'Other'])
    .withMessage('Invalid brand'),
  
  body('partNumber')
    .trim()
    .notEmpty().withMessage('Part number is required'),
  
  body('stock')
    .notEmpty().withMessage('Stock quantity is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

exports.updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Product name cannot exceed 200 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

// Order validation rules
exports.createOrderValidation = [
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  
  body('items.*.product')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('items.*.quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  
  body('shippingAddress.name')
    .trim()
    .notEmpty().withMessage('Recipient name is required'),
  
  body('shippingAddress.phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^(\+254|0)[17]\d{8}$/).withMessage('Please provide a valid Kenyan phone number'),
  
  body('shippingAddress.street')
    .trim()
    .notEmpty().withMessage('Street address is required'),
  
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  
  body('shippingAddress.county')
    .trim()
    .notEmpty().withMessage('County is required'),
  
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['M-Pesa', 'Cash on Delivery']).withMessage('Invalid payment method')
];

// Review validation rules
exports.createReviewValidation = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10-1000 characters'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters')
];

// Query validation
exports.paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// ID parameter validation
exports.mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

module.exports = exports;