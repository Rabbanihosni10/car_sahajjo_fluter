const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  carModel: String,
  carBrand: String,
  carYear: Number,
  salary: {
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['hourly', 'daily', 'monthly', 'fixed'],
      required: true
    },
    currency: {
      type: String,
      default: 'BDT'
    }
  },
  requirements: {
    experience: Number, // minimum years
    licenseRequired: Boolean,
    languages: [String],
    skills: [String]
  },
  workSchedule: {
    startDate: Date,
    endDate: Date,
    hoursPerDay: Number,
    daysPerWeek: Number,
    flexible: Boolean
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'filled', 'cancelled'],
    default: 'open'
  },
  applications: [{
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'interview', 'accepted', 'rejected'],
      default: 'pending'
    },
    coverLetter: String,
    interview: {
      scheduled: Boolean,
      date: Date,
      location: String,
      notes: String
    },
    rejectionReason: String
  }],
  selectedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contract: {
    signed: Boolean,
    signedAt: Date,
    contractDocument: String,
    terms: String
  },
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for searching
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ 'location.city': 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
