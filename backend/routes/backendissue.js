const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { authenticateToken, requireAdmin } = require('../middleware/auth'); // Add requireAdmin here
const { checkAreaAccess, filterByArea } = require('../middleware/areaAuth');
const upload = require('../middleware/Upload.js');
const { validateIssue, validateVote } = require('../middleware/validateIssue');

// Apply area filter to all routes
router.use(authenticateToken);
router.use(filterByArea);

// Routes with area access control
router.post('/', upload.single('image'), checkAreaAccess, issueController.createIssue);
router.get('/', issueController.getAllIssues);
router.get('/type/:type', issueController.getIssuesByType);
router.get('/location/:location', issueController.getIssuesByLocation);
router.get('/:id', issueController.getIssue);
router.get('/admin/area', requireAdmin, issueController.getAdminAreaIssues); // authenticateToken already applied above
router.patch('/:id/status', checkAreaAccess, issueController.updateIssueStatus);
router.delete('/:id', checkAreaAccess, issueController.deleteIssue);

module.exports = router;