const { validateTelegramInitData, validateBotToken } = require('../services/telegramService.cjs');;
const { getUserByTelegramId, createProfile, updateExistingUserProfile, getUserRole, createEmailUser, getUserByEmail, saveOTP, verifyOTP: verifyUserOTP, deleteOTP } = require('../services/userService.cjs');;
const { getBalance } = require('../services/balanceService.cjs');;
const { getReferralStats, verifyReferralCode, getReferrerInfo, generateReferralCode } = require('../services/referralService.cjs');;
const { ValidationError, UnauthorizedError } = require('../utils/errors.cjs');;
const log = require('../utils/logger.cjs');;
const crypto = require('crypto');;

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

async function handleEmailRegister(req, res, next) {
  try {
    const { email, password, firstName, lastName, referralCode } = req.body;

    if (!email || !password || !firstName) {
      throw new ValidationError('Email, password, and firstName are required');
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Hash password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Generate referral code for new user
    const newReferralCode = generateReferralCode(Date.now());

    // Create email user
    const profile = await createEmailUser({
      email,
      passwordHash,
      firstName,
      lastName: lastName || null,
      referralCode: newReferralCode,
      referralCodeInput: referralCode
    });

    const balance = await getBalance(profile.id);
    const referralStats = await getReferralStats(profile.id);
    const role = await getUserRole(profile.id);

    log.info('Email registration successful:', profile.id);

    res.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        referral_code: profile.referral_code,
        referred_by: profile.referred_by,
        created_at: profile.created_at
      },
      balance,
      referralStats,
      role
    });
  } catch (error) {
    next(error);
  }
}

async function handleEmailLogin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Hash password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Find user by email and verify password
    const query = 'SELECT * FROM profiles WHERE email = $1 AND password_hash = $2';
    const result = await require('../config/database.cjs').pool.query(query, [email, passwordHash]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const profile = result.rows[0];
    const balance = await getBalance(profile.id);
    const referralStats = await getReferralStats(profile.id);
    const role = await getUserRole(profile.id);

    // Update last login
    await require('../services/userService.cjs').updateProfile(profile.id, {});

    log.info('Email login successful:', profile.id);

    res.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        referral_code: profile.referral_code,
        created_at: profile.created_at
      },
      balance,
      referralStats,
      role
    });
  } catch (error) {
    next(error);
  }
}

async function handleSendOTP(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save OTP
    await saveOTP(user.id, otp, expiry);

    log.info('OTP sent to:', email, 'OTP:', otp);

    // In production, you would send email here
    // For now, we'll just log it (for testing)
    console.log('OTP for', email, ':', otp);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // For development/testing, return OTP in response
      // In production, remove this!
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    next(error);
  }
}

async function handleVerifyOTP(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ValidationError('Email and OTP are required');
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify OTP
    const isValid = await verifyUserOTP(user.id, otp);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }

    // Delete used OTP
    await deleteOTP(user.id);

    // Get user data
    const balance = await getBalance(user.id);
    const referralStats = await getReferralStats(user.id);
    const role = await getUserRole(user.id);

    log.info('OTP verification successful:', user.id);

    res.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        referral_code: user.referral_code,
        created_at: user.created_at
      },
      balance,
      referralStats,
      role
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
  handleEmailRegister,
  handleEmailLogin,
  handleSendOTP,
  handleVerifyOTP,
};
