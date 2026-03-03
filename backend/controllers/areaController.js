const Area = require('../models/Area');
const Issue = require('../models/Issue');

const getAllAreas = async (req, res) => {
  try {
    const areas = await Area.findAll();
    res.json({ areas });
  } catch (error) {
    console.error('Get areas error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAreasByType = async (req, res) => {
  try {
    const { type } = req.params;
    const areas = await Area.findByType(type);
    res.json({ areas });
  } catch (error) {
    console.error('Get areas by type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getIssuesByArea = async (req, res) => {
  try {
    const { areaId } = req.params;
    const issues = await Area.getIssuesByArea(areaId);
    res.json({ issues });
  } catch (error) {
    console.error('Get issues by area error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createArea = async (req, res) => {
  try {
    const { name, type, description } = req.body;

    // Validate
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    if (!['estate', 'municipality', 'complex'].includes(type)) {
      return res.status(400).json({ error: 'Invalid area type' });
    }

    const newArea = await Area.create({ name, type, description });
    res.status(201).json({ message: 'Area created successfully', area: newArea });

  } catch (error) {
    console.error('Create area error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllAreas,
  getAreasByType,
  getIssuesByArea,
  createArea
};