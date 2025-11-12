// controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadImage, uploadMultipleImages, deleteImage } = require('../config/cloudinary');

// @desc    Get all products with filters and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };

    // Category filter
    if (req.query.category) {
      const category = await Category.findOne({ slug: req.query.category });
      if (category) {
        filter.category = category._id;
      }
    }

    // Brand filter
    if (req.query.brand) {
      filter.brand = req.query.brand;
    }

    // Vehicle filter
    if (req.query.vehicle) {
      filter['compatibility.model'] = new RegExp(req.query.vehicle, 'i');
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Search filter
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Featured/Best seller filter
    if (req.query.featured === 'true') filter.featured = true;
    if (req.query.bestSeller === 'true') filter.bestSeller = true;

    // In stock filter
    if (req.query.inStock === 'true') filter.inStock = true;

    // Sort options
    let sort = {};
    switch (req.query.sort) {
      case 'price-asc':
        sort = { price: 1 };
        break;
      case 'price-desc':
        sort = { price: -1 };
        break;
      case 'name-asc':
        sort = { name: 1 };
        break;
      case 'name-desc':
        sort = { name: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Execute query
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by ID first, then by slug
    let product = await Product.findById(id)
      .populate('category', 'name slug icon')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      });

    if (!product) {
      product = await Product.findOne({ slug: id })
        .populate('category', 'name slug icon')
        .populate({
          path: 'reviews',
          populate: {
            path: 'user',
            select: 'name avatar'
          }
        });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await product.incrementViewCount();

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      featured: true, 
      isActive: true,
      inStock: true
    })
      .populate('category', 'name slug')
      .limit(6)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
};

// @desc    Get best seller products
// @route   GET /api/products/best-sellers
// @access  Public
exports.getBestSellers = async (req, res) => {
  try {
    const products = await Product.find({ 
      bestSeller: true, 
      isActive: true,
      inStock: true
    })
      .populate('category', 'name slug')
      .limit(6)
      .sort({ soldCount: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch best sellers'
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await Product.find({
      $text: { $search: q },
      isActive: true
    })
      .populate('category', 'name slug')
      .limit(20)
      .sort({ score: { $meta: 'textScore' } });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    // Upload images if provided
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadMultipleImages(
        req.files.map(file => file.buffer.toString('base64')),
        'jomo-auto-parts'
      );
      images = uploadedImages.map(img => ({
        url: img.url,
        public_id: img.public_id,
        alt: req.body.name
      }));
    }

    const productData = {
      ...req.body,
      images: images.length > 0 ? images : req.body.images || []
    };

    const product = await Product.create(productData);

    // Update category product count
    const category = await Category.findById(product.category);
    if (category) {
      await category.updateProductCount();
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Handle image uploads if provided
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (img.public_id) {
            await deleteImage(img.public_id);
          }
        }
      }

      // Upload new images
      const uploadedImages = await uploadMultipleImages(
        req.files.map(file => file.buffer.toString('base64')),
        'jomo-auto-parts'
      );
      req.body.images = uploadedImages.map(img => ({
        url: img.url,
        public_id: img.public_id,
        alt: req.body.name || product.name
      }));
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.public_id) {
          await deleteImage(img.public_id);
        }
      }
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    // Update category product count
    const category = await Category.findById(product.category);
    if (category) {
      await category.updateProductCount();
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

module.exports = exports;