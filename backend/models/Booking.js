const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bookingType: {
    type: String,
    enum: ['rental', 'test-drive', 'driver-hire'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  pickupLocation: {
    address: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  dropoffLocation: {
    address: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  pricing: {
    baseRate: Number,
    rateType: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly']
    },
    duration: Number, // in hours or days
    subtotal: Number,
    securityDeposit: Number,
    insurance: Number,
    extraCharges: [{
      description: String,
      amount: Number
    }],
    discount: {
      code: String,
      amount: Number
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
  // Negotiation
  negotiation: {
    enabled: Boolean,
    proposedRate: Number,
    counterRate: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'counter-offered']
    },
    messages: [{
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      message: String,
      proposedRate: Number,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'partially-paid', 'refunded'],
      default: 'pending'
    },
    method: String,
    transactionId: String,
    paidAmount: Number,
    paidAt: Date
  },
  // For rental tracking
  actualStartTime: Date,
  actualEndTime: Date,
  startMileage: Number,
  endMileage: Number,
  distanceTraveled: Number,
  fuelAtStart: String,
  fuelAtEnd: String,
  // Damage report
  damageReport: {
    reported: Boolean,
    description: String,
    images: [String],
    estimatedCost: Number,
    resolved: Boolean
  },
  notes: String,
  cancellation: {
    cancelled: Boolean,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'rejected']
    }
  }
}, {
  timestamps: true
});

// Index for conflict detection
bookingSchema.index({ car: 1, startDate: 1, endDate: 1, status: 1 });

// Method to check for conflicts
bookingSchema.statics.checkConflict = async function(carId, startDate, endDate, excludeBookingId = null) {
  const query = {
    car: carId,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      { startDate: { $lte: endDate, $gte: startDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  const conflicts = await this.find(query);
  return conflicts.length > 0;
};

module.exports = mongoose.model('Booking', bookingSchema);
