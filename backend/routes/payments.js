const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Payment = require('../models/Payment');

// @route   POST /api/payments
// @desc    Process payment
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const paymentData = { ...req.body, user: req.userId };
    const payment = new Payment(paymentData);
    await payment.save();
    res.status(201).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/payments
// @desc    Get payment history
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.userId })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
