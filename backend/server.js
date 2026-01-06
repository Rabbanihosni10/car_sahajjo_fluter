require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const Chat = require('./models/Chat');

const app = express();
const server = http.createServer(app);

// Configure CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/chat', limiter, chatRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Car Sahajjo API Server' });
});

// Socket.IO JWT Authentication Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  // Join chat room
  socket.on('join-chat', async (chatId) => {
    try {
      // Optionally validate participant membership
      const chat = await Chat.findById(chatId);
      if (chat && chat.participants.some(p => p.toString() === socket.userId)) {
        socket.join(chatId);
        console.log(`User ${socket.userId} joined chat ${chatId}`);
      } else {
        socket.emit('error', { message: 'Access denied to this chat' });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Send message
  socket.on('send-message', async (data) => {
    try {
      const { chatId, content, attachments } = data;

      if (!chatId || !content) {
        return socket.emit('error', { message: 'Invalid message data' });
      }

      const chat = await Chat.findById(chatId);

      if (!chat) {
        return socket.emit('error', { message: 'Chat not found' });
      }

      // Check if user is participant
      if (!chat.participants.some(p => p.toString() === socket.userId)) {
        return socket.emit('error', { message: 'Access denied' });
      }

      const newMessage = {
        sender: socket.userId,
        content,
        attachments: attachments || [],
        timestamp: new Date(),
      };

      chat.messages.push(newMessage);
      chat.lastMessage = {
        sender: socket.userId,
        content,
        timestamp: newMessage.timestamp,
      };

      await chat.save();

      const savedMessage = chat.messages[chat.messages.length - 1];

      // Emit to all users in the chat room
      io.to(chatId).emit('receive-message', {
        chatId,
        message: savedMessage,
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Expose io to routes
app.set('io', io);

const PORT = process.env.PORT || 6000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
