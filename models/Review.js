// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    url: String,
    public_id: String
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Check if user purchased the product
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Order = mongoose.model('Order');
    
    const hasPurchased = await Order.findOne({
      user: this.user,
      'items.product': this.product,
      paymentStatus: 'completed'
    });
    
    this.isVerifiedPurchase = !!hasPurchased;
  }
  next();
});

// Update product rating after save
reviewSchema.post('save', async function() {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.product);
  
  if (product) {
    await product.updateRating();
  }
});

// Update product rating after delete
reviewSchema.post('remove', async function() {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.product);
  
  if (product) {
    await product.updateRating();
  }
});

// Mark review as helpful
reviewSchema.methods.markAsHelpful = async function(userId) {
  if (!this.helpfulBy.includes(userId)) {
    this.helpfulBy.push(userId);
    this.helpfulCount += 1;
    await this.save();
  }
};

// Remove helpful mark
reviewSchema.methods.removeHelpful = async function(userId) {
  const index = this.helpfulBy.indexOf(userId);
  if (index > -1) {
    this.helpfulBy.splice(index, 1);
    this.helpfulCount -= 1;
    await this.save();
  }
};

module.exports = mongoose.model('Review', reviewSchema);