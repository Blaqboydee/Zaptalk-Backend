const express = require('express');
const router = express.Router();
const {AddFriend, getFriends, removeFriend} = require('../controllers/friends.controller')

router.post("/add-friend/:id", AddFriend);
router.get("/:id/friends",getFriends);
router.delete("/remove-friend/:id", removeFriend);

module.exports = router;