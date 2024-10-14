const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const userSchema = new Schema({
  subname: {
    type: String,
    required: false,
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
    // required: true,
  },
  email: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "https://inkythuatso.com/uploads/thumbnails/800/2023/03/9-anh-dai-dien-trang-inkythuatso-03-15-27-03.jpg",
    // required: true,
  },
  followers: {
    type: [Types.ObjectId],
    ref: "User",
    default: [],
  },
  following: {
    type: [Types.ObjectId],
    ref: "User",
    default: [],
  },
});

module.exports = model("User", userSchema);
