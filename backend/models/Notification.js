const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_update', 'job_application', 'job_status', 'document_expiry',
      'payment_received', 'payment_due', 'review_received', 'message',
      'system', 'promotion', 'reminder', 'approval', 'rejection'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: mongoose.Schema.Types.Mixed, // Additional data related to notification
  channels: {
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    sms: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    inApp: {
      read: { type: Boolean, default: false },
      readAt: Date
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: String, // Deep link or URL to take action
  expiresAt: Date
}, {
  timestamps: true
});

// Index for querying user notifications
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, 'channels.inApp.read': 1 });

module.exports = mongoose.model('Notification', notificationSchema);
