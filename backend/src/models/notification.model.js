const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const notificationSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    user_id: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

module.exports = model('Notification', notificationSchema);