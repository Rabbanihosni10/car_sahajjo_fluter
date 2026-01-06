const mongoose = require('mongoose');

const serviceCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  services: [{
    type: String,
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
}, {
  timestamps: true,
});

// Create geospatial index for location-based queries
serviceCenterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ServiceCenter', serviceCenterSchema);
