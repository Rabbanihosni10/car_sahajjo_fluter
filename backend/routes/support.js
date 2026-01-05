const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const SupportTicket = require('../models/SupportTicket');

// @route   POST /api/support/tickets
// @desc    Create support ticket
// @access  Private
router.post('/tickets', authenticate, async (req, res) => {
  try {
    const ticketData = { ...req.body, user: req.userId };
    const ticket = new SupportTicket(ticketData);
    await ticket.save();
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/support/tickets
// @desc    Get user tickets
// @access  Private
router.get('/tickets', authenticate, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.userId })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/support/faq
// @desc    Get FAQ
// @access  Public
router.get('/faq', async (req, res) => {
  res.json({ 
    success: true, 
    faqs: [
      {
        question: 'How do I register as a driver?',
        answer: 'Create an account with role "driver" and submit your KYC documents for verification.'
      },
      {
        question: 'How do I list my car for rent?',
        answer: 'Go to your dashboard, add your car details, upload photos, and set rental rates.'
      }
    ]
  });
});

module.exports = router;
