// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: false, // ✅ Made optional
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please specify product category']
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  brand: {
    type: String,
    required: [true, 'Please specify product brand'],
    enum: ['Bosch', 'NGK', 'KYB', 'Denso', 'Brembo', 'Sachs', 'Monroe', 'Genuine', 'OEM', 'Mann Filter', 'Other']
  },
  partNumber: {
    type: String,
    required: [true, 'Please provide part number'],
    unique: true,
    uppercase: true,
    trim: true
  },
  compatibility: [{
    make: { 
      type: String, 
      required: true,
      enum: ['Toyota', 'Nissan', 'Mazda', 'Honda', 'Subaru', 'Mitsubishi', 'Other']
    },
    model: { 
      type: String, 
      required: true 
    },
    year: { 
      type: String, 
      required: true 
    }
  }],
  images: [{
    url: { 
      type: String, 
      required: true 
    },
    public_id: String,
    alt: String,
    order: { 
      type: Number, 
      default: 0 
    }
  }],
  stock: {
    type: Number,
    required: [true, 'Please specify stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  featured: {
    type: Boolean,
    default: false
  },
  bestSeller: {
    type: Boolean,
    default: false
  },
  specifications: {
    weight: String,
    dimensions: String,
    material: String,
    color: String,
    origin: { 
      type: String, 
      default: 'Japan' 
    },
    condition: { 
      type: String, 
      enum: ['New', 'Ex-Japan'], // ✅ Matches your constants exactly
      default: 'New' 
    }
  },
  warranty: {
    type: String,
    default: '1 Year'
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  soldCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  metaTitle: String,
  metaDescription: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Update inStock based on stock quantity
productSchema.pre('save', function(next) {
  this.inStock = this.stock > 0;
  next();
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function() {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

// Index for search optimization
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  partNumber: 'text',
  tags: 'text'
});

productSchema.index({ category: 1, price: 1 });
productSchema.index({ featured: 1, bestSeller: 1 });
productSchema.index({ 'compatibility.make': 1, 'compatibility.model': 1 });
productSchema.index({ slug: 1 });
productSchema.index({ partNumber: 1 });

// Method to increment view count
productSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save();
};

// Method to update rating
productSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ product: this._id, isApproved: true });
  
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = (totalRating / reviews.length).toFixed(1);
    this.numReviews = reviews.length;
  } else {
    this.rating = 0;
    this.numReviews = 0;
  }
  
  await this.save();
};

module.exports = mongoose.model('Product', productSchema);