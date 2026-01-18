const express = require('express');
const {
  handleGetPlatformStats,
  handleGetAdminUserProfile,
} = require('../controllers/adminController.cjs');

const router = express.Router();

router.get('/platform-stats', handleGetPlatformStats);
router.get('/admin-user-profile', handleGetAdminUserProfile);

module.exports = router;
