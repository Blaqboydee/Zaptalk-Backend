const express = require("express");
const router = express.Router();
const {
  sendFriendRequest,
  cancelFriendRequest,
  getFriendRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} = require("../controllers/friendRequest.controller");

// Sender
router.post("/:id", sendFriendRequest);          // send request
router.post("/:id/cancel", cancelFriendRequest); // cancel request
router.get("/:id/sent", getSentRequests);        // get sent requests

// Receiver
router.get("/:id", getFriendRequests);           // get incoming requests
router.post("/:id/accept", acceptFriendRequest); // accept
router.post("/:id/reject", rejectFriendRequest); // reject

module.exports = router;
