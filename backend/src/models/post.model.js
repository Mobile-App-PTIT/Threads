const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    media: {
        type: Array,
        default: [],
    },
    status: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
    },
    likes: {
        type: [Types.ObjectId],
        ref: 'User',
        default: [],
    },
    replies: { // array of replies to this post
        type: [Types.ObjectId],
        ref: 'Reply',
        default: [],
    },
    user_id: { // user_id of the person who posted
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

module.exports = model('Post', postSchema);



