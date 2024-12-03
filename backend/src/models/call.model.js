const mongoose = require('mongoose');
const {Schema, model, Types} = mongoose;

const callSchema = new Schema({
    participants: {
        type: [Types.ObjectId],
        ref: 'User',
        required: true,
        validate: {
            validator: function (v) {
                return v.length === 2;
            },
            message: props => `Participants array must contain exactly two user IDs.`
        }
    },
}, {timestamps: true});

module.exports = model('Call', callSchema);