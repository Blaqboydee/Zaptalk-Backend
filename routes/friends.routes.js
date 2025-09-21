const express = require("express");
const router = express.Router();

const {
  getFriends,
  removeFriend
} = require("../controllers/friends.controller");

router.get("/:id/friends", getFriends);
router.delete("/remove-friend", removeFriend);

module.exports = router;
