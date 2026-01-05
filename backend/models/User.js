const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'driver', 'admin', 'vendor'],
    default: 'owner'
  },
  profilePhoto: {
    type: String,
    default: null
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  // KYC Details for Drivers
  kycDetails: {
    idType: {
      type: String,
      enum: ['passport', 'drivingLicense', 'nationalId', 'other']
    },
    idNumber: String,
    idDocument: String, // file path
    licenseNumber: String,
    licenseDocument: String, // file path
    licenseExpiry: Date,
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    rejectionReason: String
  },
  // Approval Status
  isApproved: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  // Driver specific
  driverDetails: {
    experience: Number, // years
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    availability: {
      type: Boolean,
      default: true
    },
    hourlyRate: Number,
    dailyRate: Number,
    languages: [String],
    specializations: [String] // e.g., 'luxury cars', 'long distance', etc.
  },
  // Owner specific
  ownerDetails: {
    companyName: String,
    taxId: String,
    businessLicense: String
  },
  // Vendor specific
  vendorDetails: {
    businessName: String,
    businessType: String,
    taxId: String,
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      routingNumber: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    darkMode: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update rating
userSchema.methods.updateRating = function(newRating) {
  if (this.role === 'driver' && this.driverDetails) {
    const currentTotal = this.driverDetails.rating * this.driverDetails.totalRatings;
    this.driverDetails.totalRatings += 1;
    this.driverDetails.rating = (currentTotal + newRating) / this.driverDetails.totalRatings;
  }
};

module.exports = mongoose.model('User', userSchema);
