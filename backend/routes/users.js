const express = require('express');
const router = express.Router();
const { updateArea, getProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.get('/profile', authenticateToken, getProfile);
router.patch('/area', authenticateToken, updateArea);

module.exports = router;