const Issue = require('../models/Issue'); // Import Issue model for issue-specific checks

// Middleware to attach area filter to request for controllers
const filterByArea = (req, res, next) => {
  // Add area filter to req for controllers to use
  // If user is superadmin (admin with no area), no filter applied
  // Otherwise, restrict to user's area
  req.areaFilter = req.user?.area_id || null;
  next();
};

// Middleware to check if user has access to a specific area
const checkAreaAccess = (req, res, next) => {
  // Get area ID from request body, params, or query
  const requestedAreaId = req.body.area_id || req.params.areaId || req.query.areaId;

  // Super admin (role admin with no area) can access any area
  if (req.user.role === 'admin' && req.user.area_id === null) {
    return next();
  }

  // If no area specified, proceed (will be handled by controller with req.areaFilter)
  if (!requestedAreaId) {
    return next();
  }

  // Check if user's area matches requested area
  if (req.user.area_id !== parseInt(requestedAreaId)) {
    return res.status(403).json({
      error: 'Access denied. You can only access resources in your assigned area.'
    });
  }

  next();
};

// Middleware to check if user can access a specific issue
const checkIssueAccess = async (req, res, next) => {
  try {
    const issueId = req.params.id;

    // Fetch issue from database
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Super admin (admin with no area) can access any issue
    if (req.user.role === 'admin' && req.user.area_id === null) {
      req.issue = issue; // Attach issue to request for later use
      return next();
    }

    // Check if user's area matches issue's area
    if (req.user.area_id !== issue.area_id) {
      return res.status(403).json({
        error: 'Access denied. You can only access issues in your assigned area.'
      });
    }

    // For non-admin users, check if they own the issue (for modification)
    if (req.user.role !== 'admin' && req.user.id !== issue.user_id) {
      return res.status(403).json({
        error: 'Access denied. You can only modify your own issues.'
      });
    }

    req.issue = issue; // Attach issue to request for later use
    next();
  } catch (error) {
    console.error('Issue access check error:', error);
    res.status(500).json({ error: 'Server error during access check' });
  }
};

module.exports = {
  filterByArea,
  checkAreaAccess,
  checkIssueAccess
};