const { User } = require("../models");

//  GET FRIENDS 
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

// REMOVE FRIEND 
const removeFriend = async (req, res) => {

  // console.log(req.body);
  
  try {
    const friendIdToRemove = req.body.friendId;
    const currentUserId = req.body.userId; // or from auth middleware
    const userName = req.body.userName
    
    // Your actual MongoDB operations
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { friends: friendIdToRemove }
    });
    
    await User.findByIdAndUpdate(friendIdToRemove, {
      $pull: { friends: currentUserId }
    });

    //  req.io.to(currentUserId).emit("friend_removed", { friendIdToRemove });
    req.io.to(friendIdToRemove).emit("friend_removed", { friendId: currentUserId, name: userName });
    
    res.status(200).json({ 
      success: true, 
      message: "Friend removed successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

//

module.exports = {
  getFriends,
  removeFriend,
};
