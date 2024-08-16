const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;


const messageSchema = new Schema({
    type: {
        type: String,
        enum: ['text', 'image', 'audio'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        required: true,
    },
    sender_id: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver_id: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
})

module.exports = model('Message', messageSchema);