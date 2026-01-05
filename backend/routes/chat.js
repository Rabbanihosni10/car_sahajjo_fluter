const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Chat = require('../models/Chat');

// @route   GET /api/chat
// @desc    Get user chats
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.userId })
      .populate('participants', 'name profilePhoto')
      .sort({ 'lastMessage.timestamp': -1 });
    
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/chat
// @desc    Create or get chat
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { participantId } = req.body;
    
    let chat = await Chat.findOne({
      type: 'private',
      participants: { $all: [req.userId, participantId] }
    });
    
    if (!chat) {
      chat = new Chat({
        participants: [req.userId, participantId],
        type: 'private'
      });
      await chat.save();
    }
    
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
