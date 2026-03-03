const express = require('express');
const router = express.Router();
const {
  requestPasswordReset,
  verifyResetCode,
  resetPassword
} = require('../controllers/passwordResetController');

router.post('/request', requestPasswordReset);
router.post('/verify', verifyResetCode);
router.post('/reset', resetPassword);

module.exports = router;