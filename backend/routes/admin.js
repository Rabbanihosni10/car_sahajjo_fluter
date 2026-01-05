const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const Car = require('../models/Car');
const Product = require('../models/Product');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/dashboard', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      totalDrivers: await User.countDocuments({ role: 'driver' }),
      totalOwners: await User.countDocuments({ role: 'owner' }),
      pendingApprovals: await User.countDocuments({ approvalStatus: 'pending' }),
      totalJobs: await Job.countDocuments(),
      totalCars: await Car.countDocuments(),
      totalProducts: await Product.countDocuments()
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin
// @access  Private (Admin)
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, approvalStatus, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.json({ 
      success: true, 
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/approve
// @desc    Approve user
// @access  Private (Admin)
router.put('/users/:id/approve', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        approvalStatus: 'approved',
        approvedBy: req.userId,
        approvedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/kyc/:id/verify
// @desc    Verify KYC
// @access  Private (Admin)
router.put('/kyc/:id/verify', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        'kycDetails.verified': true,
        'kycDetails.verifiedBy': req.userId,
        'kycDetails.verifiedAt': new Date()
      },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
