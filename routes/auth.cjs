const express = require('express');;
const {
  handleTelegramAuth,
  handleUserRegister,
  handleGetUserByTelegramId,
  handleVerifyReferralCode,
} = require('../controllers/authController.cjs');;

const router = express.Router();

router.post('/telegram-auth', handleTelegramAuth);
router.post('/users/register', handleUserRegister);
router.get('/users/:telegramId', handleGetUserByTelegramId);
router.post('/referral-code/verify', handleVerifyReferralCode);

module.exports = router;
