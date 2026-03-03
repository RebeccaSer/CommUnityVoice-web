const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areaController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', areaController.getAllAreas);
router.get('/type/:type', areaController.getAreasByType);
router.get('/:areaId/issues', areaController.getIssuesByArea);
router.post('/', authenticateToken, requireAdmin, areaController.createArea);

module.exports = router;