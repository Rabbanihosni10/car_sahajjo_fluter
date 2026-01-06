require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Chat = require('./models/Chat');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/car_sahajjo';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Make io available to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a chat room
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat: ${chatId}`);
  });

  // Leave a chat room
  socket.on('leave-chat', (chatId) => {
    socket.leave(chatId);
    console.log(`Socket ${socket.id} left chat: ${chatId}`);
  });

  // Handle incoming messages
  socket.on('send-message', async (data) => {
    try {
      const { chatId, userId, content, attachments } = data;

      if (!chatId || !userId || !content) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      // Find the chat
      const chat = await Chat.findById(chatId);
      
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      // Verify user is participant
      if (!chat.participants.includes(userId)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Create and save message
      const message = {
        sender: userId,
        content: content.trim(),
        attachments: attachments || [],
        readBy: [{
          user: userId,
          readAt: new Date()
        }],
        timestamp: new Date()
      };

      chat.messages.push(message);
      await chat.save();

      // Get the saved message
      const savedMessage = chat.messages[chat.messages.length - 1];
      await chat.populate('messages.sender', 'name email');

      // Emit to all clients in the room
      io.to(chatId).emit('receive-message', {
        chatId,
        message: savedMessage
      });

      console.log(`Message sent to chat ${chatId}:`, savedMessage._id);
    } catch (error) {
      console.error('Error handling send-message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('user-typing', {
      chatId: data.chatId,
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Car Sahajjo API Server' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 6000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
