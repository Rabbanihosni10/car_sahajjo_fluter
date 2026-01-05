const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Review = require('../models/Review');

// @route   POST /api/reviews
// @desc    Create review
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const reviewData = { ...req.body, reviewer: req.userId };
    const review = new Review(reviewData);
    await review.save();
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/reviews/:type/:id
// @desc    Get reviews for entity
// @access  Public
router.get('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const query = { reviewType: type };
    query[type] = id;
    
    const reviews = await Review.find(query)
      .populate('reviewer', 'name profilePhoto')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
