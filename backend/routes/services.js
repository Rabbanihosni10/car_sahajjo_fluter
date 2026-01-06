const express = require('express');
const ServiceCenter = require('../models/ServiceCenter');

const router = express.Router();

// GET /api/services/nearby - Get nearby service centers
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const distance = parseInt(maxDistance) || 5000; // Default 5km
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }
    
    // Query using MongoDB geospatial query
    const serviceCenters = await ServiceCenter.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: distance, // Distance in meters
        },
      },
    }).limit(50);
    
    res.json(serviceCenters);
  } catch (error) {
    console.error('Nearby services error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
