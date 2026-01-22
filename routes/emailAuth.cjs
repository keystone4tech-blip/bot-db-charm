const express = require('express');
const router = express.Router();
const { 
  handleEmailRegistration, 
  handleEmailLogin, 
  handleLinkTelegramAccount,
  handleSendOTP,
  handleVerifyOTP
} = require('../controllers/emailAuthController.cjs');

// Регистрация по email
router.post('/register', handleEmailRegistration);

// Вход по email
router.post('/login', handleEmailLogin);

// Привязка Telegram аккаунта к email аккаунту
router.post('/link-telegram', handleLinkTelegramAccount);

// Отправка OTP
router.post('/send-otp', handleSendOTP);

// Проверка OTP
router.post('/verify-otp', handleVerifyOTP);

module.exports = router;