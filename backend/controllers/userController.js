const User = require('../models/User');

const updateArea = async (req, res) => {
  return res.status(403).json({ error: 'Area cannot be changed after registration' });
};
  

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  updateArea,
  getProfile
};