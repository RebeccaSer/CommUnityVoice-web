const validateIssue = (req, res, next) => {
  const { title, description } = req.body;
  console.log(req)
  console.log('Validating issue:', req.body);
  console.log('Title:', title);
  console.log('Description:', description);
  if (!title || title.trim().length == 0) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (title.length > 100) {
    return res.status(400).json({ error: 'Title must be less than 100 characters' });
  }

  if (description && description.length > 500) {
    return res.status(400).json({ error: 'Description must be less than 500 characters' });
  }

  next();
};

const validateVote = (req, res, next) => {
  const { vote_type } = req.body;

  if (!vote_type || !['approve', 'reject'].includes(vote_type)) {
    return res.status(400).json({ error: 'Vote type must be either "approve" or "reject"' });
  }

  next();
};

module.exports = { validateIssue, validateVote };