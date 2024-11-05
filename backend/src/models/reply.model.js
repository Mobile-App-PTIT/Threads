const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const replySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    media: {
        type: Array,
        default: [],
    },
    likes: {
        type: [Types.ObjectId],
        ref: 'User',
        default: [],
    },
    replies: { // array of replies to this reply
        type: [Types.ObjectId],
        ref: 'Reply',
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    post_id: { // post_id of the post to which this reply belongs
        type: Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    user_id: { // user_id of the person who replied
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    }
})

module.exports = model('Reply', replySchema);