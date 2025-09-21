const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connect = require("./db");
const { Message, User } = require("./models");

// Routes
const userRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require("./routes/message.routes");
const authRoutes = require("./routes/auth.routes");
const friendRoutes = require("./routes/friends.routes");
const friendRequestsRoutes = require("./routes/friendRequests.routes");

const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://172.18.64.1:3000",
  "http://192.168.0.187:5173",
  "https://zaptalk-frontend.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Attach io to every request
let io; // defined later
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/users", userRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);
app.use("/auth", authRoutes);
app.use("/friends", friendRoutes);
app.use("/friendRequests", friendRequestsRoutes);

app.get("/", (req, res) => {
  res.send("ZapTalk API is running...");
});

// Socket.IO setup
io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // When a user comes online
  socket.on("user-online", async (userId) => {
    try {
      // ✅ Join a private room with the userId
      socket.join(userId);

      await User.findByIdAndUpdate(userId, {
        "status.state": "online",
        "status.lastSeen": null,
      });

      io.emit("user-status-updated", {
        userId,
        status: { state: "online", lastSeen: null },
      });

      console.log(`👤 User ${userId} is online and joined room ${userId}`);
    } catch (err) {
      console.error("Error setting user online:", err);
    }
  });

  // Join multiple chats
  socket.on("join_chats", (chatIds) => {
    if (!Array.isArray(chatIds)) return;
    chatIds.forEach((chatId) => socket.join(chatId));
  });

  // Join a single chat
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  // Send message
  socket.on("send_message", async (data) => {
    if (!data.content || !data.senderId || !data.chatId) return;

    try {
      const message = await Message.create({
        content: data.content,
        senderId: data.senderId,
        chatId: data.chatId,
      });

      await message.populate("senderId", "name email");
      io.to(data.chatId).emit("receive_message", message);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Leave chat
  socket.on("leave_chat", (chatId) => {
    socket.leave(chatId);
  });

  // Mark user offline manually
  socket.on("user-offline", async (userId) => {
    try {
      const lastSeen = new Date();
      await User.findByIdAndUpdate(userId, {
        "status.state": "offline",
        "status.lastSeen": lastSeen,
      });

      io.emit("user-status-updated", {
        userId,
        status: { state: "offline", lastSeen },
      });

      console.log(`⚠️ User ${userId} went offline`);
    } catch (err) {
      console.error("Error setting user offline:", err);
    }
  });

  // Disconnect handler
  socket.on("disconnect", async () => {
    console.log("❌ User disconnected:", socket.id);

    // ⚠️ We don’t know userId directly on disconnect anymore
    // (Frontend should emit "user-offline" before closing tab)
  });
});

// Start server
connect();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
