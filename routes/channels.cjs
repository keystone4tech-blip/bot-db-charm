const express = require('express');;
const {
  handleGetUserChannels,
  handleCreateChannel,
} = require('../controllers/channelController.cjs');;

const router = express.Router();

router.get('/telegram-channels/:userId', handleGetUserChannels);
router.post('/telegram-channels', handleCreateChannel);

module.exports = router;
