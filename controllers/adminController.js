// controllers/adminController.js
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's stats
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Pending orders
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['processing', 'confirmed'] }
    });

    // Low stock count
    const lowStockCount = await Product.countDocuments({
      stock: { $lte: 5, $gt: 0 },
      isActive: true
    });

    // Out of stock count
    const outOfStockCount = await Product.countDocuments({
      stock: 0,
      isActive: true
    });

    // Total products
    const totalProducts = await Product.countDocuments({
      isActive: true
    });

    // This week's revenue
    const weekRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thisWeekStart },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // This month's revenue
    const monthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonthStart },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Total customers
    const totalCustomers = await User.countDocuments({
      role: 'customer'
    });

    // Revenue trend (last 7 days)
    const last7Days = new Date(now.setDate(now.getDate() - 7));
    const revenueTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        today: {
          orders: todayOrders,
          revenue: todayRevenue[0]?.total || 0
        },
        week: {
          revenue: weekRevenue[0]?.total || 0
        },
        month: {
          revenue: monthRevenue[0]?.total || 0
        },
        orders: {
          pending: pendingOrders,
          total: await Order.countDocuments()
        },
        products: {
          total: totalProducts,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount
        },
        customers: totalCustomers,
        revenueTrend
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// @desc    Get recent activity (orders & products)
// @route   GET /api/admin/recent-activity
// @access  Private/Admin
exports.getRecentActivity = async (req, res) => {
  try {
    // Last 10 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber totalAmount orderStatus paymentStatus createdAt');

    // Last 10 products added
    const recentProducts = await Product.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name price stock images createdAt');

    res.status(200).json({
      success: true,
      recentOrders,
      recentProducts
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
};

// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.search) {
      filter.$or = [
        { orderNumber: new RegExp(req.query.search, 'i') },
        { 'shippingAddress.name': new RegExp(req.query.search, 'i') },
        { 'shippingAddress.phone': new RegExp(req.query.search, 'i') }
      ];
    }

    // Execute query
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status using the model method
    order.updateStatus(status, note, req.user._id);
    await order.save();

    // Populate order details for response
    await order.populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// @desc    Get low stock products
// @route   GET /api/admin/products/low-stock
// @access  Private/Admin
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      stock: { $lte: 5, $gt: 0 },
      isActive: true
    })
      .populate('category', 'name')
      .sort({ stock: 1 })
      .select('name partNumber stock images price');

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products'
    });
  }
};

// @desc    Get all products for admin (includes hidden/inactive)
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAdminProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Admin can see ALL products
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { partNumber: new RegExp(req.query.search, 'i') }
      ];
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.isVisible !== undefined) {
      filter.isVisible = req.query.isVisible === 'true';
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

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
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// @desc    Toggle product visibility
// @route   PATCH /api/admin/products/:id/visibility
// @access  Private/Admin
exports.toggleProductVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isVisible = !product.isVisible;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isVisible ? 'shown' : 'hidden'} successfully`,
      product
    });
  } catch (error) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle visibility'
    });
  }
};

module.exports = exports;