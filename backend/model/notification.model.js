const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const notificationSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    user_id: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
})

module.exports = model('Notification', notificationSchema);