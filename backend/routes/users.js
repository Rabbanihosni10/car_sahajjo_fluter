const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Prevent password update through this route
    delete updates.role; // Prevent role change
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/users/profile/photo
// @desc    Upload profile photo
// @access  Private
router.post('/profile/photo', authenticate, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePhoto: `/uploads/profiles/${req.file.filename}` },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/users/kyc
// @desc    Submit KYC documents (for drivers)
// @access  Private (Driver)
router.post('/kyc', authenticate, authorize('driver'), upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'licenseDocument', maxCount: 1 }
]), async (req, res) => {
  try {
    const { idType, idNumber, licenseNumber, licenseExpiry } = req.body;
    
    const kycData = {
      idType,
      idNumber,
      licenseNumber,
      licenseExpiry,
      verified: false
    };
    
    if (req.files['idDocument']) {
      kycData.idDocument = `/uploads/kyc/${req.files['idDocument'][0].filename}`;
    }
    
    if (req.files['licenseDocument']) {
      kycData.licenseDocument = `/uploads/kyc/${req.files['licenseDocument'][0].filename}`;
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { kycDetails: kycData },
      { new: true }
    ).select('-password');
    
    res.json({ 
      success: true, 
      message: 'KYC documents submitted for verification',
      user 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/drivers
// @desc    Get list of approved drivers
// @access  Public
router.get('/drivers', async (req, res) => {
  try {
    const { city, minRating, availability } = req.query;
    const query = { 
      role: 'driver', 
      isApproved: true,
      'kycDetails.verified': true
    };
    
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (minRating) query['driverDetails.rating'] = { $gte: parseFloat(minRating) };
    if (availability !== undefined) query['driverDetails.availability'] = availability === 'true';
    
    const drivers = await User.find(query)
      .select('name profilePhoto address driverDetails rating')
      .limit(50);
    
    res.json({ success: true, drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
