const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;


const messageSchema = new Schema({
  type: {
    type: String,
    enum: ['text', 'image'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'read'],
    required: true
  },
  sender_id: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
    index: { expireAfterSeconds: 7776000 } // TTL index for 90 days
  },
  seenAt: {
    type: Date
  }
});

module.exports = model('Message', messageSchema);