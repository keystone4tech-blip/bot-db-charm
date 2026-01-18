const express = require('express');;
const {
  handleGetUserBots,
  handleCreateBot,
} = require('../controllers/botController.cjs');;

const router = express.Router();

router.get('/user-bots/:userId', handleGetUserBots);
router.post('/user-bots', handleCreateBot);

module.exports = router;
