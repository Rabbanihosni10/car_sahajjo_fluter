const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedTo: {
    type: String,
    enum: ['booking', 'order', 'subscription', 'deposit', 'other'],
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'BDT'
  },
  method: {
    type: String,
    enum: ['card', 'bkash', 'nagad', 'rocket', 'bank-transfer', 'cash', 'other'],
    required: true
  },
  gateway: {
    type: String,
    enum: ['sslcommerz', 'stripe', 'bkash', 'nagad', 'manual']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: String,
  gatewayResponse: mongoose.Schema.Types.Mixed,
  invoice: {
    invoiceNumber: String,
    invoiceFile: String,
    generatedAt: Date
  },
  refund: {
    initiated: Boolean,
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected']
    },
    refundedAt: Date,
    refundTransactionId: String
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
