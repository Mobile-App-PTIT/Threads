const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const replySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
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
    user_id: { // user_id of the person who replied
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    }
})

module.exports = model('Reply', replySchema);