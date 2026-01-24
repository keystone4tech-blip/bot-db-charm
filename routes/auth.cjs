const express = require('express');;
const {
  handleTelegramAuth,
  handleUserRegister,
  handleGetUserByTelegramId,
  handleVerifyReferralCode,
  handleEmailRegister,
  handleEmailLogin,
  handleSendOTP,
  handleVerifyOTP,
} = require('../controllers/authController.cjs');;

const router = express.Router();

router.post('/telegram-auth', handleTelegramAuth);
router.post('/users/register', handleUserRegister);
router.get('/users/:telegramId', handleGetUserByTelegramId);
router.post('/referral-code/verify', handleVerifyReferralCode);
router.post('/email/register', handleEmailRegister);
router.post('/email/login', handleEmailLogin);
router.post('/email/send-otp', handleSendOTP);
router.post('/email/verify-otp', handleVerifyOTP);

module.exports = router;
