const { User } = require("../models");


async function AddFriend(req, res) {
     try {
    const userId = req.body.userId; // logged in user
    const friendId = req.params.id;

    if (userId === friendId) {
      return res.status(400).json({ message: "You cannot add yourself." });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Already friends." });
    }

    user.friends.push(friendId);
    friend.friends.push(userId);

    await user.save();
    await friend.save();

    res.json({ message: "Friend added successfully", user, friend });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getFriends(req, res) {
  try {
    const user = await User.findById(req.params.id).populate(
      "friends",
      "name email avatar status bioStatus"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // Format clean response
    const friends = user.friends.map(friend => ({
      _id: friend._id,
      name: friend.name,
      email: friend.email,
      avatar: friend.avatar,
      status: friend.status,
      bioStatus: friend.bioStatus,
    }));

    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



async function removeFriend(req, res) {
     try {
         
    const userId = req.body.id;
    const friendId = req.params.id;
  


    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    res.json({ message: "Friend removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

}
module.exports = {AddFriend, getFriends, removeFriend};
