// backend/models.js
const mongoose = require("mongoose");

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  name: String,
  isDirect: { type: Boolean, default: false },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
}, { timestamps: true });


const messageSchema = new mongoose.Schema({
  content: String,
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
}, { timestamps: true });

module.exports = {
  User: mongoose.model("User", userSchema),
  Chat: mongoose.model("Chat", chatSchema),
  Message: mongoose.model("Message", messageSchema),
};
