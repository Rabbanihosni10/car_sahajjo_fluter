const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    
    const products = await Product.find(query)
      .populate('vendor', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create product
// @access  Private (Vendor)
router.post('/', authenticate, authorize('vendor'), async (req, res) => {
  try {
    const productData = { ...req.body, vendor: req.userId };
    const product = new Product(productData);
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
