const Vote = require('../models/Vote');
const Issue = require('../models/Issue');

const voteOnIssue = async (req, res) => {
  try {
    const { issue_id, vote_type } = req.body;
    const user_id = req.user.id;

    // Check if issue exists
    const issue = await Issue.findById(issue_id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check if user is trying to vote on their own issue
    if (issue.user_id === user_id) {
      return res.status(400).json({ error: 'Cannot vote on your own issue' });
    }

    // Create or update vote
    const vote = await Vote.create({
      issue_id,
      user_id,
      vote_type
    });

    // Get updated vote counts
    const voteCounts = await Vote.getVoteCounts(issue_id);

    res.json({
      message: 'Vote recorded successfully',
      vote,
      voteCounts
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserVote = async (req, res) => {
  try {
    const { issue_id } = req.params;
    const user_id = req.user.id;

    const vote = await Vote.findByUserAndIssue(user_id, issue_id);
    res.json({ vote: vote ? vote.vote_type : null });
  } catch (error) {
    console.error('Get user vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { voteOnIssue, getUserVote };