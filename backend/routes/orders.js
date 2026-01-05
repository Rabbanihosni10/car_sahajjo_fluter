const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Order = require('../models/Order');

// @route   POST /api/orders
// @desc    Create order
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const orderData = { ...req.body, customer: req.userId };
    const order = new Order(orderData);
    await order.save();
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
