const express = require('express');
const router = express.Router();
const { createMessage, getMessages, getAllMessages } = require('../controllers/message.controller');

router.post('/', createMessage);
router.get('/', getMessages);
router.get("/all", getAllMessages);

module.exports = router;
