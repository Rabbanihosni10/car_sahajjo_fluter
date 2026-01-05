const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['spare-parts', 'accessories', 'tools', 'fluids', 'electronics', 'maintenance', 'other'],
    required: true
  },
  subCategory: String,
  images: [String],
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'BDT'
  },
  compareAtPrice: Number, // original price for showing discounts
  stock: {
    quantity: {
      type: Number,
      required: true,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    inStock: {
      type: Boolean,
      default: true
    }
  },
  specifications: {
    brand: String,
    model: String,
    partNumber: String,
    compatibility: [String], // compatible car models
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    warranty: {
      duration: Number,
      unit: {
        type: String,
        enum: ['days', 'months', 'years']
      },
      description: String
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for searching
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
