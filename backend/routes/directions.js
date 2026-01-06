const express = require('express');
const axios = require('axios');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// POST /api/directions - Get directions from Google Directions API
router.post('/', authenticate, async (req, res) => {
  try {
    const { origin, destination } = req.body;
    
    if (!origin || !origin.lat || !origin.lng) {
      return res.status(400).json({ error: 'Origin with lat and lng is required' });
    }
    
    if (!destination || !destination.lat || !destination.lng) {
      return res.status(400).json({ error: 'Destination with lat and lng is required' });
    }
    
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }
    
    const originStr = `${origin.lat},${origin.lng}`;
    const destinationStr = `${destination.lat},${destination.lng}`;
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: originStr,
        destination: destinationStr,
        key: GOOGLE_MAPS_API_KEY,
      },
    });
    
    if (response.data.status !== 'OK') {
      return res.status(400).json({ 
        error: 'Failed to get directions', 
        status: response.data.status,
        message: response.data.error_message,
      });
    }
    
    const route = response.data.routes[0];
    const leg = route.legs[0];
    
    const result = {
      polyline: route.overview_polyline.points,
      distance: leg.distance,
      duration: leg.duration,
      steps: leg.steps.map(step => {
        // Remove HTML tags and decode HTML entities from instructions
        const instruction = step.html_instructions
          .replace(/<[^>]*>/g, '') // Basic tag removal
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"');
        
        return {
          instruction,
          distance: step.distance,
          duration: step.duration,
          polyline: step.polyline.points,
        };
      }),
    };
    
    res.json(result);
  } catch (error) {
    console.error('Directions API error:', error.message);
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'Google Maps API error',
        message: error.response.data,
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
