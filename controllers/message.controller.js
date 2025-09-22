const { Message, Chat, User } = require("../models");

// Create a message
async function createMessage(req, res) {
  try {
    const { content, senderId, chatId } = req.body;

    // Make sure sender and chat exist
    const sender = await User.findById(senderId);
    const chat = await Chat.findById(chatId);
    if (!sender || !chat) {
      return res.status(404).json({ error: "Sender or Chat not found" });
    }

    const message = await Message.create({
      content,
      senderId,
      chatId,
    });

    // Add message to chat's messages array
    chat.messages.push(message._id);
    await chat.save();

    // Populate senderId and chatId before sending
    await message.populate("senderId chatId");

    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get all messages or by chat

async function getMessages(req, res) {
  try {
    const { chatId } = req.query;

    let messages;
    if (chatId) {
      messages = await Message.find({ chatId })
        .populate("senderId", "name email") 
        .sort({ createdAt: 1 }) 
        .exec();
    } else {
      messages = await Message.find()
        .populate("senderId", "name email")
        .sort({ createdAt: 1 })
        .exec();
    }

    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getAllMessages(req, res) {
  try {
    const allMessages = await Message.find();
    
    res.status(200).json({
      success: true,
      count: allMessages.length,
      data: allMessages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages',
      error: error.message
    });
  }

}
module.exports = { createMessage, getMessages , getAllMessages};
