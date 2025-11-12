// controllers/paymentController.js
const Order = require('../models/Order');
const { initiateSTKPush, querySTKStatus } = require('../config/mpesa');

// @desc    Initiate M-Pesa payment
// @route   POST /api/payment/mpesa/initiate
// @access  Private
exports.initiateMpesaPayment = async (req, res) => {
  try {
    const { orderId, phoneNumber } = req.body;

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Initiate STK Push
    const stkResponse = await initiateSTKPush(
      phoneNumber,
      order.totalAmount,
      order.orderNumber,
      `Payment for order ${order.orderNumber}`
    );

    // Save M-Pesa details to order
    order.mpesaDetails = {
      merchantRequestID: stkResponse.MerchantRequestID,
      checkoutRequestID: stkResponse.CheckoutRequestID,
      phoneNumber: phoneNumber
    };
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment request sent. Please check your phone to complete payment.',
      data: {
        merchantRequestID: stkResponse.MerchantRequestID,
        checkoutRequestID: stkResponse.CheckoutRequestID,
        responseDescription: stkResponse.ResponseDescription
      }
    });
  } catch (error) {
    console.error('M-Pesa initiate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate M-Pesa payment'
    });
  }
};

// @desc    M-Pesa callback
// @route   POST /api/payment/mpesa/callback
// @access  Public (M-Pesa)
exports.mpesaCallback = async (req, res) => {
  try {
    console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

    const {
      Body: {
        stkCallback: {
          MerchantRequestID,
          CheckoutRequestID,
          ResultCode,
          ResultDesc,
          CallbackMetadata
        }
      }
    } = req.body;

    // Find order by CheckoutRequestID
    const order = await Order.findOne({
      'mpesaDetails.checkoutRequestID': CheckoutRequestID
    }).populate('user', 'name email');

    if (!order) {
      console.error('Order not found for CheckoutRequestID:', CheckoutRequestID);
      return res.status(200).json({ message: 'Order not found' });
    }

    // Check if payment was successful
    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata.Item;
      const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber')?.Value;

      // Update order
      order.markAsPaid({
        mpesaReceiptNumber,
        transactionDate: new Date(transactionDate.toString()),
        phoneNumber: phoneNumber.toString()
      });

      order.orderStatus = 'confirmed';
      await order.save();

      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        io.emit('paymentSuccess', {
          orderId: order._id,
          orderNumber: order.orderNumber
        });
      }

      console.log('✅ Payment successful for order:', order.orderNumber);
    } else {
      // Payment failed
      order.paymentStatus = 'failed';
      order.statusHistory.push({
        status: 'payment_failed',
        note: `Payment failed: ${ResultDesc}`,
        timestamp: Date.now()
      });
      await order.save();

      console.log('❌ Payment failed for order:', order.orderNumber, ResultDesc);
    }

    // Acknowledge receipt
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(200).json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
};

// @desc    Check M-Pesa payment status
// @route   GET /api/payment/mpesa/status/:checkoutRequestId
// @access  Private
exports.checkMpesaStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    // Find order
    const order = await Order.findOne({
      'mpesaDetails.checkoutRequestID': checkoutRequestId,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Query M-Pesa
    const statusResponse = await querySTKStatus(checkoutRequestId);

    res.status(200).json({
      success: true,
      data: {
        resultCode: statusResponse.ResultCode,
        resultDesc: statusResponse.ResultDesc,
        isPaid: order.isPaid,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus
      }
    });
  } catch (error) {
    console.error('Check M-Pesa status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
};

// @desc    Verify payment (manual verification)
// @route   POST /api/payment/verify
// @access  Private/Admin
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, mpesaReceiptNumber } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Mark as paid
    order.markAsPaid({
      mpesaReceiptNumber,
      transactionDate: new Date()
    });
    
    order.orderStatus = 'confirmed';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

module.exports = exports;