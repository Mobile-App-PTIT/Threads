const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const tokenSchema = new Schema({
  refreshToken: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = model("Token", tokenSchema);
