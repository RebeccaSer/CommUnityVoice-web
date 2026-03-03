const express = require('express');
const router = express.Router();
const { voteOnIssue, getUserVote } = require('../controllers/voteController');
const { authenticateToken } = require('../middleware/auth');
const { validateVote } = require('../middleware/validateIssue');

router.post('/', authenticateToken, validateVote, voteOnIssue);
router.get('/:issue_id', authenticateToken, getUserVote);

module.exports = router;