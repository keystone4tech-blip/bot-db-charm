const crypto = require('crypto');
const { UnauthorizedError } = require('../utils/errors.cjs');;
const log = require('../utils/logger.cjs');;
const { AUTH_DATA_MAX_AGE } = require('../config/constants.cjs');;

function validateTelegramInitData(initData, botToken) {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      log.error('No hash in initData');
      return null;
    }
    
    params.delete('hash');
    
    const dataCheckArr = [];
    params.sort();
    params.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    const dataCheckString = dataCheckArr.join('\n');
    
    const secretKey = crypto
      .createHmac('sha256', crypto.createHash('sha256').update('WebAppData').digest())
      .update(botToken)
      .digest();
    
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    if (calculatedHash !== hash.toLowerCase()) {
      log.error('Hash mismatch:', { calculated: calculatedHash, received: hash.toLowerCase() });
      return null;
    }
    
    const authDate = parseInt(params.get('auth_date') || '0');
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > AUTH_DATA_MAX_AGE) {
      log.error('Auth data expired');
      return null;
    }
    
    const userStr = params.get('user');
    if (!userStr) {
      log.error('No user in initData');
      return null;
    }
    
    const user = JSON.parse(userStr);
    
    return {
      user,
      auth_date: authDate || 0,
      hash,
      query_id: params.get('query_id') || undefined,
      start_param: params.get('start_param') || undefined,
    };
  } catch (error) {
    log.error('Error validating initData:', error);
    return null;
  }
}

function validateBotToken() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    log.error('TELEGRAM_BOT_TOKEN not configured');
    throw new UnauthorizedError('Bot token not configured');
  }
  return botToken;
}

module.exports = {
  validateTelegramInitData,
  validateBotToken,
};
