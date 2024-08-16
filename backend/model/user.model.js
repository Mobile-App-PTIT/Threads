const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    followers: {
        type: [Types.ObjectId],
        ref: 'User',
        default: [],
    },
    following: {
        type: [Types.ObjectId],
        ref: 'User',
        default: [],
    },
})

module.exports = model('User', userSchema);