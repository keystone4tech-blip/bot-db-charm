const express = require('express');;
const {
  handleGetActiveCampaigns,
  handleGetScheduledPosts,
  handleGetWeeklyStats,
} = require('../controllers/promotionController.cjs');;

const router = express.Router();

// Маршруты для продвижения
router.get('/promotion/campaigns/:userId', handleGetActiveCampaigns);
router.get('/promotion/scheduled-posts/:userId', handleGetScheduledPosts);
router.get('/promotion/weekly-stats/:userId', handleGetWeeklyStats);

module.exports = router;