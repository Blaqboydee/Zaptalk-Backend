const mongoose = require("mongoose");

const { User } = require("../models");
// Get all users (for showing users to start a chat)
async function getUsers(req, res) {
  try {
    const users = await User.find({}, { password: 0, __v: 0 }); // exclude sensitive fields
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
}

// Get logged-in user's profile
async function getProfile(req, res) {
  try {
    const userId = req.user.id; // from JWT middleware

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(userId, { password: 0, __v: 0 });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports = { getUsers, getProfile };
