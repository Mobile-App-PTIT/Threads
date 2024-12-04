const mongoose = require('mongoose');
const {Schema, model, Types} = mongoose;

const callSchema = new Schema({
    sender_id: {type: Types.ObjectId, ref: 'User', required: true},
    receiver_id: {type: Types.ObjectId, ref: 'User', required: true},
    type: {
        type: String,
        enum: ['voice', 'video'],
        required: true
    },
}, {timestamps: true});

module.exports = model('Call', callSchema);