const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Booking = require('../models/Booking');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const bookingData = { ...req.body, customer: req.userId };
    
    // Check for conflicts
    const hasConflict = await Booking.checkConflict(
      bookingData.car,
      bookingData.startDate,
      bookingData.endDate
    );
    
    if (hasConflict) {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking conflict detected. Car is not available for these dates.' 
      });
    }
    
    const booking = new Booking(bookingData);
    await booking.save();
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.userId })
      .populate('car')
      .populate('driver', 'name profilePhoto')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
