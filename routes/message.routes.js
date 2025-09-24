const express = require('express');
const router = express.Router();
const { createMessage, getMessages, getAllMessages, editMessage, deleteMessage } = require('../controllers/message.controller');

router.post('/', createMessage);
router.get('/', getMessages);
router.get("/all", getAllMessages);
router.put('/:messageId', editMessage);
router.delete('/:messageId', deleteMessage);


module.exports = router;
