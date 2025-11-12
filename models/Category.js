// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide category name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    url: String,
    public_id: String
  },
  icon: {
    type: String,
    default: 'wrench'
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  productCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Method to update product count
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  this.productCount = await Product.countDocuments({ 
    category: this._id,
    isActive: true 
  });
  await this.save();
};

// Static method to get all categories with product count
categorySchema.statics.getAllWithCount = async function() {
  const Product = mongoose.model('Product');
  
  const categories = await this.find({ isActive: true })
    .sort({ order: 1, name: 1 });
  
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({
        category: category._id,
        isActive: true
      });
      
      return {
        ...category.toObject(),
        productCount
      };
    })
  );
  
  return categoriesWithCount;
};

module.exports = mongoose.model('Category', categorySchema);