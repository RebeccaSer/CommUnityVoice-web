const Issue = require('../models/Issue');
const Vote = require('../models/Vote');

const createIssue = async (req, res) => {
  try {
    console.log('=== BACKEND: CREATE ISSUE REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    
    const { title, description, street_address, issue_date, issue_type, area_id } = req.body;

    // Debug: Log all received fields
    console.log('=== BACKEND: PARSED FIELDS ===');
    console.log('Title:', title);
    console.log('Description:', description);
    console.log('Street Address:', street_address);
    console.log('Issue Date:', issue_date);
    console.log('Issue Type:', issue_type);
    console.log('Area ID:', area_id);

    // Basic validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!street_address || !street_address.trim()) {
      return res.status(400).json({ error: 'Street address is required' });
    }

    if (!issue_date) {
      return res.status(400).json({ error: 'Issue date is required' });
    }

    // For regular users, use their assigned area
    let finalAreaId = area_id;
    
    if (req.user.role === 'user') {
      if (!req.user.area_id) {
        return res.status(400).json({ error: 'You must select an area in your profile before reporting issues' });
      }
      finalAreaId = req.user.area_id;
    } else if (req.user.role === 'admin') {
      // Admin can only create issues in their assigned area
      if (!req.user.area_id) {
        return res.status(400).json({ error: 'Admin has no area assigned. Please contact super admin.' });
      }
      
      // If admin tries to create issue for different area, block it
      if (area_id && parseInt(area_id) !== req.user.area_id) {
        return res.status(403).json({ 
          error: 'Access denied. You can only create issues in your assigned area.' 
        });
      }
      finalAreaId = req.user.area_id;
    }

    // Validate issue date is not in the future
    const selectedDate = new Date(issue_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      return res.status(400).json({ error: 'Issue date cannot be in the future' });
    }

    const issueData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      street_address: street_address.trim(),
      issue_date,
      issue_type: issue_type || 'other',
      area_id: finalAreaId,
      image_url: req.file ? req.file.path : null,
      user_id: req.user.id
    };

    console.log('=== BACKEND: FINAL ISSUE DATA ===');
    console.log(issueData);

    const newIssue = await Issue.create(issueData);
    res.status(201).json({ 
      message: 'Issue reported successfully', 
      issue: newIssue 
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};

const getAllIssues = async (req, res) => {
  try {
    let issues;
    
    // Apply area filter based on user role
    if (req.user.role === 'admin' && req.user.area_id) {
      // Admin sees only issues from their area
      issues = await Issue.findByArea(req.user.area_id);
    } else if (req.user.role === 'user' && req.user.area_id) {
      // Regular users see only their area's issues
      issues = await Issue.findByArea(req.user.area_id);
    } else {
      // Super admin or users with no area (fallback)
      issues = await Issue.findAll();
    }
    
    console.log(`Found ${issues.length} issues`);
    res.json({ issues });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check area access
    if (req.user.role === 'admin' && req.user.area_id && req.user.area_id !== issue.area_id) {
      return res.status(403).json({ 
        error: 'Access denied. You can only view issues in your assigned area.' 
      });
    }

    if (req.user.role === 'user' && req.user.area_id !== issue.area_id) {
      return res.status(403).json({ 
        error: 'Access denied. You can only view issues in your area.' 
      });
    }

    // Get user's vote if authenticated
    let userVote = null;
    if (req.user) {
      userVote = await Vote.findByUserAndIssue(req.user.id, req.params.id);
    }

    res.json({ issue, userVote: userVote ? userVote.vote_type : null });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get the issue to check its area
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check if user has permission to update this issue
    if (req.user.role === 'admin') {
      // Super admin can update any issue (area_id === null)
      if (req.user.area_id !== null) {
        // Area admin can only update issues in their area
        if (issue.area_id !== req.user.area_id) {
          return res.status(403).json({ 
            error: 'You can only update issues in your own area' 
          });
        }
      }
    } else {
      // Regular users can only update their own issues
      if (issue.user_id !== req.user.id) {
        return res.status(403).json({ 
          error: 'You can only update your own issues' 
        });
      }
    }

    const result = await Issue.updateStatus(id, status);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ message: 'Issue status updated successfully' });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Consolidated deleteIssue function
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the issue to check its area
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check if user has permission to delete this issue
    if (req.user.role === 'admin') {
      // Super admin can delete any issue (area_id === null)
      if (req.user.area_id !== null) {
        // Area admin can only delete issues in their area
        if (issue.area_id !== req.user.area_id) {
          return res.status(403).json({ 
            error: 'You can only delete issues in your own area' 
          });
        }
      }
    } else {
      // Regular users can only delete their own issues
      if (issue.user_id !== req.user.id) {
        return res.status(403).json({ 
          error: 'You can only delete your own issues' 
        });
      }
    }

    const result = await Issue.delete(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Filter Issues
const getIssuesByType = async (req, res) => {
  try {
    const { type } = req.params;
    let issues = await Issue.findByType(type);
    
    // Filter by user's area
    if (req.user.area_id) {
      issues = issues.filter(issue => issue.area_id === req.user.area_id);
    }
    
    res.json({ issues });
  } catch (error) {
    console.error('Get issues by type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getIssuesByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    let issues = await Issue.findByLocation(location);
    
    // Filter by user's area
    if (req.user.area_id) {
      issues = issues.filter(issue => issue.area_id === req.user.area_id);
    }
    
    res.json({ issues });
  } catch (error) {
    console.error('Get issues by location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin-specific function to get issues for admin's area
const getAdminAreaIssues = async (req, res) => {
  try {
    if (!req.user.area_id) {
      // Super admin - get all issues
      const issues = await Issue.findAll();
      return res.json({ issues });
    }
    
    // Area admin - get only their area's issues
    const issues = await Issue.findByArea(req.user.area_id);
    res.json({ issues });
  } catch (error) {
    console.error('Get admin issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { 
  createIssue, 
  getAllIssues, 
  getIssue, 
  updateIssueStatus, 
  deleteIssue,
  getIssuesByType,
  getIssuesByLocation,
  getAdminAreaIssues
};