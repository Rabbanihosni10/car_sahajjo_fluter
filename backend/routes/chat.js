const express = require('express');
const Chat = require('../models/Chat');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Get all chats for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.userId,
      isActive: true,
    })
      .populate('participants', 'name email')
      .sort({ 'lastMessage.timestamp': -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new chat
router.post('/', authenticate, async (req, res) => {
  try {
    const { participants, type, name } = req.body;

    // Ensure current user is in participants
    if (!participants.includes(req.userId.toString())) {
      participants.push(req.userId);
    }

    const chat = new Chat({
      participants,
      type: type || 'private',
      name,
      messages: [],
    });

    await chat.save();
    await chat.populate('participants', 'name email');

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a chat (paginated)
router.get('/:id/messages', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p.toString() === req.userId.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get paginated messages (newest first)
    const totalMessages = chat.messages.length;
    const startIndex = Math.max(0, totalMessages - (page * limit));
    const endIndex = Math.max(0, totalMessages - ((page - 1) * limit));
    
    const messages = chat.messages.slice(startIndex, endIndex).reverse();

    res.json({
      messages,
      page,
      limit,
      total: totalMessages,
      hasMore: startIndex > 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post a new message to a chat
router.post('/:id/messages', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p.toString() === req.userId.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newMessage = {
      sender: req.userId,
      content,
      attachments: attachments || [],
      timestamp: new Date(),
    };

    chat.messages.push(newMessage);
    chat.lastMessage = {
      sender: req.userId,
      content,
      timestamp: newMessage.timestamp,
    };

    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];

    // Emit via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      io.to(id).emit('receive-message', {
        chatId: id,
        message: savedMessage,
      });
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
