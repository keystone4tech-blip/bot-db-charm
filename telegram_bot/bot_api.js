const express = require('express');
const { bot } = require('./bot_instance'); // Импортируем экземпляр бота
const router = express.Router();

// Эндпоинт для отправки аутентификационного кода пользователю
router.post('/send-auth-code', async (req, res) => {
  try {
    const { telegramId, authCode } = req.body;

    if (!telegramId || !authCode) {
      return res.status(400).json({ error: 'telegramId and authCode are required' });
    }

    // Отправляем сообщение пользователю с кодом
    const messageText = `Ваш код для входа в приложение: <b>${authCode}</b>\n\nВведите этот код на сайте для входа в аккаунт.`;
    
    await bot.sendMessage(telegramId, messageText, {
      parse_mode: 'HTML'
    });

    res.json({
      success: true,
      message: 'Auth code sent successfully'
    });
  } catch (error) {
    console.error('Error sending auth code:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;