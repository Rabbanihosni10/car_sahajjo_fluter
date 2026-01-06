const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/chat - List all chats for the authenticated user
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.userId })
      .populate('participants', 'username email')
      .populate('lastMessage.sender', 'username')
      .sort({ 'lastMessage.timestamp': -1 });
    
    res.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Error fetching chats' });
  }
});

// POST /api/chat - Create a new chat
router.post('/', async (req, res) => {
  try {
    const { participantIds } = req.body;
    
    if (!participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({ error: 'participantIds array is required' });
    }
    
    // Ensure current user is included in participants
    const participants = [...new Set([req.userId, ...participantIds])];
    
    // Validate all participants exist
    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      return res.status(400).json({ error: 'One or more participants not found' });
    }
    
    // Check if chat already exists with same participants
    const existingChat = await Chat.findOne({
      participants: { $all: participants, $size: participants.length }
    });
    
    if (existingChat) {
      return res.json({ 
        message: 'Chat already exists',
        chat: await existingChat.populate('participants', 'username email')
      });
    }
    
    // Create new chat
    const chat = new Chat({
      participants,
      messages: [],
      lastMessage: null
    });
    
    await chat.save();
    await chat.populate('participants', 'username email');
    
    res.status(201).json({
      message: 'Chat created successfully',
      chat
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Error creating chat' });
  }
});

// POST /api/chat/:id/messages - Add a message to a chat
router.post('/:id/messages', async (req, res) => {
  try {
    const { content, attachments } = req.body;
    const chatId = req.params.id;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Find chat and verify user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'You are not a participant in this chat' });
    }
    
    // Create new message
    const message = {
      sender: req.userId,
      content: content.trim(),
      attachments: attachments || [],
      readBy: [req.userId],
      timestamp: new Date()
    };
    
    // Add message to chat
    chat.messages.push(message);
    
    // Update lastMessage
    chat.lastMessage = {
      sender: req.userId,
      content: content.trim(),
      timestamp: message.timestamp
    };
    
    await chat.save();
    
    // Get the saved message with populated sender
    const savedMessage = chat.messages[chat.messages.length - 1];
    await chat.populate('messages.sender', 'username email');
    const populatedMessage = chat.messages[chat.messages.length - 1];
    
    // Emit socket event if io is available
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('receive-message', {
        chatId,
        message: {
          _id: populatedMessage._id,
          sender: populatedMessage.sender,
          content: populatedMessage.content,
          attachments: populatedMessage.attachments,
          readBy: populatedMessage.readBy,
          timestamp: populatedMessage.timestamp
        }
      });
    }
    
    res.status(201).json({
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
});

// GET /api/chat/:id/messages - Get paginated messages for a chat
router.get('/:id/messages', async (req, res) => {
  try {
    const chatId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    // Find chat and verify user is a participant
    const chat = await Chat.findById(chatId)
      .populate('messages.sender', 'username email');
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ error: 'You are not a participant in this chat' });
    }
    
    // Get paginated messages (newest first)
    const totalMessages = chat.messages.length;
    const startIndex = Math.max(0, totalMessages - (page * limit));
    const endIndex = totalMessages - ((page - 1) * limit);
    const messages = chat.messages.slice(startIndex, endIndex).reverse();
    
    res.json({
      messages,
      pagination: {
        page,
        limit,
        total: totalMessages,
        hasMore: startIndex > 0
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

module.exports = router;
