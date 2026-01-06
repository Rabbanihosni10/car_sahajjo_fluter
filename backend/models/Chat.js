const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  attachments: [{
    url: String,
    filename: String,
    mimeType: String,
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private',
  },
  name: {
    type: String,
  },
  lastMessage: {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    timestamp: Date,
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create indexes
chatSchema.index({ participants: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });

module.exports = mongoose.model('Chat', chatSchema);
