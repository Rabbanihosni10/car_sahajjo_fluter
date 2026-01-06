const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

// GET /api/chat - List all chats for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.userId
    })
      .populate('participants', 'name email')
      .populate('lastMessage.sender', 'name')
      .sort({ 'lastMessage.timestamp': -1 })
      .lean();

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// POST /api/chat - Create a new chat
router.post('/', auth, async (req, res) => {
  try {
    const { participants } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Participants array is required' });
    }

    // Add the current user to participants if not already included
    if (!participants.includes(req.userId)) {
      participants.push(req.userId);
    }

    // Check if chat already exists with same participants
    const existingChat = await Chat.findOne({
      participants: { $all: participants, $size: participants.length }
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat
    const chat = new Chat({
      participants,
      messages: []
    });

    await chat.save();
    await chat.populate('participants', 'name email');

    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// GET /api/chat/:id/messages - Get paginated message history
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Find chat and verify user is participant
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get paginated messages (reverse order for pagination, newest first)
    const totalMessages = chat.messages.length;
    const messages = chat.messages
      .slice(Math.max(0, totalMessages - skip - limit), totalMessages - skip)
      .reverse();

    // Populate sender information
    await chat.populate('messages.sender', 'name email');

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total: totalMessages,
        pages: Math.ceil(totalMessages / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/chat/:id/messages - Add a message to chat
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Find chat and verify user is participant
    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create message object
    const message = {
      sender: req.userId,
      content: content.trim(),
      attachments: attachments || [],
      readBy: [{
        user: req.userId,
        readAt: new Date()
      }],
      timestamp: new Date()
    };

    // Add message to chat
    chat.messages.push(message);
    await chat.save();

    // Get the saved message with populated sender
    const savedMessage = chat.messages[chat.messages.length - 1];
    await chat.populate('messages.sender', 'name email');

    // Emit socket event if io is available
    const io = req.app.get('io');
    if (io) {
      io.to(id).emit('receive-message', {
        chatId: id,
        message: savedMessage
      });
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

module.exports = router;
