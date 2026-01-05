const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  color: String,
  licensePlate: {
    type: String,
    required: true,
    unique: true
  },
  vin: String, // Vehicle Identification Number
  mileage: {
    value: Number,
    unit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km'
    }
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
    required: true
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic', 'semi-automatic'],
    required: true
  },
  seats: Number,
  images: [String],
  specifications: {
    engineCapacity: String,
    horsePower: Number,
    torque: String,
    fuelEfficiency: String,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    weight: Number,
    features: [String] // e.g., 'GPS', 'Bluetooth', 'Sunroof'
  },
  condition: {
    type: String,
    enum: ['new', 'excellent', 'good', 'fair', 'poor']
  },
  // For Sale
  forSale: {
    type: Boolean,
    default: false
  },
  saleDetails: {
    price: Number,
    negotiable: Boolean,
    description: String,
    sold: {
      type: Boolean,
      default: false
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    soldAt: Date
  },
  // For Rent
  forRent: {
    type: Boolean,
    default: false
  },
  rentalDetails: {
    hourlyRate: Number,
    dailyRate: Number,
    weeklyRate: Number,
    monthlyRate: Number,
    securityDeposit: Number,
    insuranceRequired: Boolean,
    insuranceAmount: Number,
    minimumRentalPeriod: Number, // in hours
    maxDistance: Number, // km per day
    extraDistanceCharge: Number,
    fuelPolicy: {
      type: String,
      enum: ['full-to-full', 'same-to-same', 'pre-paid']
    },
    pickupLocations: [{
      address: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }],
    availability: {
      type: Boolean,
      default: true
    }
  },
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['registration', 'insurance', 'pollution', 'fitness', 'permit', 'other']
    },
    documentNumber: String,
    documentFile: String,
    issueDate: Date,
    expiryDate: Date,
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  }],
  // Current Status
  currentDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'maintenance', 'sold', 'inactive'],
    default: 'available'
  },
  // GPS Tracking (for rented cars)
  gpsEnabled: {
    type: Boolean,
    default: false
  },
  lastLocation: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    timestamp: Date
  },
  // Maintenance
  lastServiceDate: Date,
  nextServiceDate: Date,
  serviceHistory: [{
    date: Date,
    type: String,
    description: String,
    cost: Number,
    serviceCenter: String
  }],
  isActive: {
    type: Boolean,
    default: true
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
  }
}, {
  timestamps: true
});

// Index for searching
carSchema.index({ brand: 1, model: 1 });
carSchema.index({ forSale: 1, forRent: 1 });
carSchema.index({ 'rentalDetails.availability': 1, forRent: 1 });

module.exports = mongoose.model('Car', carSchema);
