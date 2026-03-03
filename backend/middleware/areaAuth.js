const Issue = require('../models/Issue');

// Check if admin has access to the issue's area
const checkAreaAccess = async (req, res, next) => {
  try {
    // If not admin, skip area check (regular users have their own restrictions)
    if (req.user.role !== 'admin') {
      return next();
    }

    const issueId = req.params.id;
    
    // If no issue ID, check if there's an area_id in the request body
    if (!issueId && req.body.area_id) {
      // For creating/updating issues, check if admin's area matches
      if (req.user.area_id !== parseInt(req.body.area_id)) {
        return res.status(403).json({ 
          error: 'Access denied. You can only create issues in your assigned area.' 
        });
      }
      return next();
    }

    // For operations on specific issues, check if issue belongs to admin's area
    if (issueId) {
      const issue = await Issue.findById(issueId);
      
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      // Check if issue's area matches admin's area
      if (req.user.area_id !== issue.area_id) {
        return res.status(403).json({ 
          error: 'Access denied. You can only manage issues in your assigned area.' 
        });
      }
    }

    next();
  } catch (error) {
    console.error('Area access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if admin has access to a specific area
const checkAreaPermission = (req, res, next) => {
  const targetAreaId = req.params.areaId || req.body.area_id;
  
  if (!targetAreaId) {
    return res.status(400).json({ error: 'Area ID is required' });
  }

  if (req.user.role === 'admin' && req.user.area_id !== parseInt(targetAreaId)) {
    return res.status(403).json({ 
      error: 'Access denied. You can only access your assigned area.' 
    });
  }

  next();
};

// Filter queries to only return data from admin's area
const filterByArea = (req, res, next) => {
  // If admin, add area filter to query
  if (req.user.role === 'admin' && req.user.area_id) {
    req.areaFilter = req.user.area_id;
  }
  next();
};

module.exports = {
  checkAreaAccess,
  checkAreaPermission,
  filterByArea
};