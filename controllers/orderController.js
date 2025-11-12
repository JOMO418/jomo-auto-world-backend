// controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail } = require('../utils/email');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (!product.inStock || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url,
        partNumber: product.partNumber,
        quantity: item.quantity,
        price: product.price
      });

      // Update product stock and sold count
      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      await product.save();
    }

    // Calculate shipping (flat rate for now)
    const shippingCost = subtotal >= 10000 ? 0 : 500;

    // Calculate total
    const totalAmount = subtotal + shippingCost;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      totalAmount,
      paymentMethod,
      notes
    });

    // Calculate estimated delivery
    order.calculateEstimatedDelivery();
    await order.save();

    // Populate order details
    await order.populate('user', 'name email phone');
    await order.populate('items.product', 'name images');

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(req.user, order);
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError);
      // Continue even if email fails
    }

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('newOrder', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        user: order.user.name
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments({ user: req.user.id });

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

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images partNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    order.updateStatus(status, note, req.user.id);
    await order.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdate', {
        orderId: order._id,
        status: status
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`
      });
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        product.soldCount -= item.quantity;
        await product.save();
      }
    }

    // Update order
    order.orderStatus = 'cancelled';
    order.cancelReason = reason;
    order.statusHistory.push({
      status: 'cancelled',
      note: `Cancelled: ${reason}`,
      updatedBy: req.user.id,
      timestamp: Date.now()
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

module.exports = exports;