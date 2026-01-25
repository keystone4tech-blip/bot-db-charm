const express = require('express');;
const {
  handleGetUserChannels,
  handleCreateChannel,
  handleGetRecommendedChannels,
} = require('../controllers/channelController.cjs');;

const router = express.Router();

router.get('/telegram-channels/:userId', handleGetUserChannels);
router.post('/telegram-channels', handleCreateChannel);
router.get('/recommended-channels', handleGetRecommendedChannels);

module.exports = router;
