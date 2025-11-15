// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: String,
    partNumber: String,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity cannot be less than 1']
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    county: { type: String, required: true },
    country: { type: String, default: 'Kenya' },
    additionalInfo: String
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['M-Pesa', 'Cash on Delivery'],
    default: 'M-Pesa'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  mpesaDetails: {
    merchantRequestID: String,
    checkoutRequestID: String,
    mpesaReceiptNumber: String,
    transactionDate: Date,
    phoneNumber: String
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  trackingNumber: String,
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
   
adminNotes: {
  type: String,
  select: false  // Hidden from customer views
},
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }],
  deliveryDate: Date,
  estimatedDeliveryDate: Date,
  notes: String,
  cancelReason: String,
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const timestamp = Date.now().toString().slice(-8);
    const orderNum = (count + 1).toString().padStart(4, '0');
    this.orderNumber = `JMO${timestamp}${orderNum}`;
  }
  next();
});

// Update payment status
orderSchema.methods.markAsPaid = function(mpesaDetails) {
  this.isPaid = true;
  this.paidAt = Date.now();
  this.paymentStatus = 'completed';
  
  if (mpesaDetails) {
    this.mpesaDetails = {
      ...this.mpesaDetails,
      ...mpesaDetails
    };
  }
  
  this.statusHistory.push({
    status: 'confirmed',
    note: 'Payment received successfully',
    timestamp: Date.now()
  });
};

// Update order status
orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.orderStatus = newStatus;
  
  this.statusHistory.push({
    status: newStatus,
    note: note || `Order ${newStatus}`,
    updatedBy,
    timestamp: Date.now()
  });
  
  // Set delivery date if delivered
  if (newStatus === 'delivered' && !this.deliveryDate) {
    this.deliveryDate = Date.now();
  }
};

// Calculate estimated delivery date (same day if before 2PM, next day if after)
orderSchema.methods.calculateEstimatedDelivery = function() {
  const now = new Date();
  const hour = now.getHours();
  
  // If ordered before 2PM, same day delivery
  if (hour < 14) {
    this.estimatedDeliveryDate = new Date(now.setHours(18, 0, 0, 0));
  } else {
    // Next day delivery
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.estimatedDeliveryDate = new Date(tomorrow.setHours(18, 0, 0, 0));
  }
};

// Static method to get sales statistics
orderSchema.statics.getSalesStats = async function(startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        },
        paymentStatus: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);
  
  return stats[0] || { totalSales: 0, totalOrders: 0, averageOrderValue: 0 };
};

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);