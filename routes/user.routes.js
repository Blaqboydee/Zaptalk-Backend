const express = require('express');
const router = express.Router();
const { getUsers, getProfile } = require('../controllers/user.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/', getUsers);
router.get('/profile', authenticateToken, getProfile)

module.exports = router;
