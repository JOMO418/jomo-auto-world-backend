// controllers/adminController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Total stats
    const [
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      todayOrders,
      thisMonthOrders,
      pendingOrders,
      lowStockProducts
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      User.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: thisMonth } }),
      Order.countDocuments({ orderStatus: 'processing' }),
      Product.countDocuments({ stock: { $lte: 5 }, isActive: true })
    ]);

    // Sales trend (last 30 days)
    const salesTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top products
    const topProducts = await Product.find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(5)
      .select('name soldCount price images');

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber totalAmount orderStatus paymentStatus createdAt');

    // Category distribution
    const categoryStats = await Category.getAllWithCount();

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalProducts,
          totalUsers,
          totalRevenue: totalRevenue[0]?.total || 0,
          todayOrders,
          thisMonthOrders,
          pendingOrders,
          lowStockProducts
        },
        salesTrend,
        topProducts,
        recentOrders,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// @desc    Get all orders (admin)
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
        { 'shippingAddress.name': new RegExp(req.query.search, 'i') }
      ];
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
        { phone: new RegExp(req.query.search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent modifying own admin role
    if (user._id.toString() === req.user.id && role && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own admin role'
      });
    }

    if (role) user.role = role;
    if (typeof isActive !== 'undefined') user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// @desc    Get sales report
// @route   GET /api/admin/reports/sales
// @access  Private/Admin
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const salesStats = await Order.getSalesStats(start, end);

    // Daily breakdown
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top products in period
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          paymentStatus: 'completed'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: salesStats,
        dailySales,
        topProducts,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report'
    });
  }
};

module.exports = exports;