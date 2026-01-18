const express = require('express');;
const {
  handleGetProfile,
  handleUpdateProfile,
} = require('../controllers/profileController.cjs');;

const router = express.Router();

router.get('/profiles/:telegramId', handleGetProfile);
router.put('/profiles/:userId', handleUpdateProfile);

module.exports = router;
