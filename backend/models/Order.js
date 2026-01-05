const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  billingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    shipping: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      code: String,
      amount: {
        type: Number,
        default: 0
      }
    },
    total: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'BDT'
    }
  },
  payment: {
    method: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  tracking: {
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    statusUpdates: [{
      status: String,
      location: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: String
    }]
  },
  deliveryDate: Date,
  notes: String,
  cancellation: {
    cancelled: Boolean,
    reason: String,
    cancelledAt: Date
  },
  invoice: {
    invoiceNumber: String,
    invoiceFile: String,
    generatedAt: Date
  }
}, {
  timestamps: true
});

// Auto-generate invoice number
orderSchema.pre('save', function(next) {
  if (!this.invoice.invoiceNumber) {
    this.invoice.invoiceNumber = `INV-${Date.now()}-${this._id.toString().slice(-6)}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
