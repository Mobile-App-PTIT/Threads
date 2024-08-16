const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const tokenSchema = new Schema({
    refreshToken: {
        type: String,
        required: true,
    },
    expriresAt: {
        type: Date,
        required: true,
    },
    user_id: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    }
})

module.exports = model('Token', tokenSchema);