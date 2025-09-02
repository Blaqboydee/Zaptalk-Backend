const express = require('express');
const router = express.Router();
const { createChat, getDirectChats, getGroupChats } = require('../controllers/chat.controller');

router.post('/', createChat);
router.get('/', getDirectChats);
router.get('/group', getGroupChats)


module.exports = router;
