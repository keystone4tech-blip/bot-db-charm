const { validateTelegramInitData, validateBotToken } = require('../services/telegramService.cjs');;
const { getUserByTelegramId, createProfile, updateExistingUserProfile, getUserRole } = require('../services/userService.cjs');;
const { getBalance } = require('../services/balanceService.cjs');;
const { getReferralStats, verifyReferralCode, getReferrerInfo } = require('../services/referralService.cjs');;
const { ValidationError, UnauthorizedError } = require('../utils/errors.cjs');;
const log = require('../utils/logger.cjs');;

async function handleTelegramAuth(req, res, next) {
  try {
    const { initData, referralCode } = req.body;

    if (!initData) {
      throw new ValidationError('initData is required');;
    }

    const botToken = validateBotToken();
    log.info('Validating Telegram initData...');;

    const validatedData = validateTelegramInitData(initData, botToken);

    if (!validatedData || !validatedData.user) {
      throw new UnauthorizedError('Invalid Telegram data');;
    }

    const telegramUser = validatedData.user;
    log.info('Telegram user validated:', telegramUser.id, telegramUser.first_name);

    let profile = await getUserByTelegramId(telegramUser.id);

    if (!profile) {
      profile = await createProfile(telegramUser, referralCode);
    } else {
      await updateExistingUserProfile(profile, telegramUser);
    }

    const balance = await getBalance(profile.id);
    const referralStats = await getReferralStats(profile.id);
    const role = await getUserRole(profile.id);

    log.info('Auth successful for user:', profile.id);

    res.json({
      success: true,
      profile,
      balance,
      referralStats,
      role,
    });
  } catch (error) {
    next(error);
  }
}

async function handleUserRegister(req, res, next) {
  try {
    const { telegram_id, first_name, last_name, username, avatar_url, referral_code } = req.body;

    if (!telegram_id || !first_name) {
      throw new ValidationError('telegram_id and first_name are required');;
    }

    let profile = await getUserByTelegramId(telegram_id);

    if (!profile) {
      log.info('Creating new profile for Telegram user:', telegram_id);

      const telegramUser = {
        id: telegram_id,
        first_name,
        last_name,
        username,
        photo_url: avatar_url,
      };

      profile = await createProfile(telegramUser, referral_code);
    } else {
      log.info('User already exists:', profile.id);
    }

    res.json({
      success: true,
      profile: {
        id: profile.id,
        telegram_id: profile.telegram_id,
        telegram_username: profile.telegram_username,
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: profile.avatar_url,
        referral_code: profile.referral_code,
        referred_by: profile.referred_by,
        created_at: profile.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

async function handleGetUserByTelegramId(req, res, next) {
  try {
    const { telegramId } = req.params;

    const profile = await getUserByTelegramId(telegramId);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      profile: {
        id: profile.id,
        telegram_id: profile.telegram_id,
        telegram_username: profile.telegram_username,
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: profile.avatar_url,
        referral_code: profile.referral_code,
        referred_by: profile.referred_by,
        created_at: profile.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

async function handleVerifyReferralCode(req, res, next) {
  try {
    const { referral_code, telegram_id } = req.body;

    if (!referral_code) {
      throw new ValidationError('referral_code is required');
    }

    const referrerInfo = await getReferrerInfo(referral_code.toUpperCase());

    if (!referrerInfo) {
      return res.json({
        valid: false,
        message: 'Реферальный код не найден'
      });
    }

    // Check if user is trying to use their own code
    if (telegram_id && referrerInfo.telegram_id === telegram_id) {
      return res.json({
        valid: false,
        message: 'Нельзя использовать свой собственный реферальный код'
      });
    }

    res.json({
      valid: true,
      user: {
        id: referrerInfo.id,
        first_name: referrerInfo.first_name,
        username: referrerInfo.telegram_username,
        referrals_count: referrerInfo.referrals_count || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleTelegramAuth,
  handleUserRegister,
  handleGetUserByTelegramId,
  handleVerifyReferralCode,
};
