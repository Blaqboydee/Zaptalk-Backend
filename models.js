const mongoose = require("mongoose");

// User schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" }, // stores Cloudinary URL

    // 🔹 Profile status (customizable by the user)
    bioStatus: {
      type: String,
      default: "Hey there! I am using Zaptalk.",
    },

    // 🔹 Presence (managed automatically by backend + socket.io)
    status: {
      state: {
        type: String,
        enum: ["online", "offline"],
        default: "offline",
      },
      lastSeen: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

// Chat schema
const chatSchema = new mongoose.Schema(
  {
    name: { type: String},
    isDirect: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  },
  { timestamps: true }
);

// Message schema
const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", userSchema),
  Chat: mongoose.model("Chat", chatSchema),
  Message: mongoose.model("Message", messageSchema),
};
