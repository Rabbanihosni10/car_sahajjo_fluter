require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const Chat = require('./models/Chat');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 6000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware
app.use(cors());
app.use(express.json());

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  try {
    // Get token from handshake query or auth
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error('Invalid authentication token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId} (socket: ${socket.id})`);
  
  // Join chat room
  socket.on('join-chat', async (data) => {
    try {
      const { chatId } = data;
      
      // Verify user is a participant in this chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }
      
      if (!chat.participants.some(p => p.toString() === socket.userId)) {
        socket.emit('error', { message: 'You are not a participant in this chat' });
        return;
      }
      
      // Join the chat room
      socket.join(chatId);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
      socket.emit('joined-chat', { chatId });
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', { message: 'Error joining chat' });
    }
  });
  
  // Send message
  socket.on('send-message', async (data) => {
    try {
      const { chatId, content, attachments } = data;
      
      if (!content || content.trim() === '') {
        socket.emit('error', { message: 'Message content is required' });
        return;
      }
      
      // Find chat and verify user is a participant
      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }
      
      if (!chat.participants.some(p => p.toString() === socket.userId)) {
        socket.emit('error', { message: 'You are not a participant in this chat' });
        return;
      }
      
      // Create new message
      const message = {
        sender: socket.userId,
        content: content.trim(),
        attachments: attachments || [],
        readBy: [socket.userId],
        timestamp: new Date()
      };
      
      // Add message to chat
      chat.messages.push(message);
      
      // Update lastMessage
      chat.lastMessage = {
        sender: socket.userId,
        content: content.trim(),
        timestamp: message.timestamp
      };
      
      await chat.save();
      
      // Populate sender info for the new message
      await chat.populate('messages.sender', 'username email');
      const savedMessage = chat.messages[chat.messages.length - 1];
      
      // Emit to all participants in the chat room
      io.to(chatId).emit('receive-message', {
        chatId,
        message: {
          _id: savedMessage._id,
          sender: savedMessage.sender,
          content: savedMessage.content,
          attachments: savedMessage.attachments,
          readBy: savedMessage.readBy,
          timestamp: savedMessage.timestamp
        }
      });
      
      console.log(`Message sent in chat ${chatId} by user ${socket.userId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Error sending message' });
    }
  });
  
  // Leave chat room
  socket.on('leave-chat', (data) => {
    const { chatId } = data;
    socket.leave(chatId);
    console.log(`User ${socket.userId} left chat ${chatId}`);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId} (socket: ${socket.id})`);
  });
});

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
