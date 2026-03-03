const User = require('../models/User');

const updateArea = async (req, res) => {
  try {
    const { area_id } = req.body;
    const userId = req.user.id;

    if (!area_id) {
      return res.status(400).json({ error: 'Area ID is required' });
    }

    await User.updateArea(userId, area_id);
    
    // Fetch updated user with area info
    const updatedUser = await User.findById(userId);

    res.json({
      message: 'Area updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update area error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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