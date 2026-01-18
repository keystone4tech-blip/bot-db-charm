const express = require('express');;
const {
  handleTelegramAuth,
  handleUserRegister,
  handleGetUserByTelegramId,
} = require('../controllers/authController.cjs');;

const router = express.Router();

router.post('/telegram-auth', handleTelegramAuth);
router.post('/users/register', handleUserRegister);
router.get('/users/:telegramId', handleGetUserByTelegramId);

module.exports = router;
