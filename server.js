const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connect = require("./db")
const { Message } = require("./models");

// Routes
const userRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require("./routes/message.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);
app.use("/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("ZapTalk API is running...");
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // Change this to your frontend URL later
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat ${chatId}`);
  });

  // Listen for messages
socket.on("send_message", async (data) => {
  console.log("Incoming message data:", data);

  if (!data.content || !data.senderId || !data.chatId) return;

  try {
    const message = await Message.create({
      content: data.content,
      senderId: data.senderId,
      chatId: data.chatId,
    });

    // Optionally populate sender info
    await message.populate("senderId", "name email");

    io.to(data.chatId).emit("receive_message", message);
    console.log("Message saved and broadcast:", message);
  } catch (err) {
    console.error("Error saving message:", err);
  }
});

socket.on("leave_chat", (chatId) => {
  socket.leave(chatId);
  console.log(`User left chat ${chatId}`);
});


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
connect()
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
