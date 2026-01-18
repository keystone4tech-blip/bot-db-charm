const { validateTelegramInitData, validateBotToken } = require('../services/telegramService.cjs');;
const { UnauthorizedError } = require('../utils/errors.cjs');;

function validateTelegramMiddleware(req, res, next) {
  try {
    const { initData } = req.body;

    if (!initData) {
      throw new UnauthorizedError('initData is required');;
    }

    const botToken = validateBotToken();
    const validatedData = validateTelegramInitData(initData, botToken);

    if (!validatedData || !validatedData.user) {
      throw new UnauthorizedError('Invalid Telegram data');;
    }

    req.telegramUser = validatedData.user;
    req.validatedData = validatedData;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = validateTelegramMiddleware;
