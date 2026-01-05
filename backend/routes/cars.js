const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Car = require('../models/Car');

// @route   POST /api/cars
// @desc    Add a new car
// @access  Private (Owner)
router.post('/', authenticate, authorize('owner'), upload.array('carImages', 5), async (req, res) => {
  try {
    const carData = { ...req.body, owner: req.userId };
    
    if (req.files && req.files.length > 0) {
      carData.images = req.files.map(file => `/uploads/cars/${file.filename}`);
    }
    
    const car = new Car(carData);
    await car.save();
    res.status(201).json({ success: true, car });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/cars
// @desc    Get cars (for sale/rent)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { forSale, forRent, brand, fuelType, transmission, minPrice, maxPrice } = req.query;
    const query = { isActive: true };
    
    if (forSale !== undefined) query.forSale = forSale === 'true';
    if (forRent !== undefined) query.forRent = forRent === 'true';
    if (brand) query.brand = new RegExp(brand, 'i');
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    
    const cars = await Car.find(query)
      .populate('owner', 'name phone')
      .limit(50);
    
    res.json({ success: true, cars });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/cars/:id
// @desc    Get single car details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('owner', 'name phone email profilePhoto');
    
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    res.json({ success: true, car });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
