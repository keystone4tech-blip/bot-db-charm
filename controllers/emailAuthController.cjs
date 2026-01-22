const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService.cjs');
const { generateReferralCode } = require('../services/referralService.cjs');
const { 
  getUserByEmail, 
  createEmailUser, 
  linkAccounts,
  saveOTP,
  verifyOTP,
  deleteOTP,
  getUserByTelegramId,
  getProfileByReferralCode
} = require('../services/userService.cjs');
const { ValidationError, UnauthorizedError } = require('../utils/errors.cjs');
const log = require('../utils/logger.cjs');

async function handleEmailRegistration(req, res, next) {
  try {
    const { email, password, firstName, lastName, referralCode } = req.body;

    if (!email || !password || !firstName) {
      throw new ValidationError('Email, password, and firstName are required');
    }

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Хешируем пароль
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Генерируем реферальный код
    const referralCodeGenerated = generateReferralCode(crypto.randomBytes(4).toString('hex'));

    // Создаем пользователя с методом аутентификации 'email'
    const user = await createEmailUser({
      email,
      passwordHash,
      firstName,
      lastName,
      referralCode: referralCodeGenerated,
      referralCodeInput: referralCode // если пользователь пришел по реферальной ссылке
    });

    // Отправляем письмо для подтверждения email
    await sendVerificationEmail(user.email, user.id);

    res.json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        referralCode: user.referral_code
      }
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

    const user = await getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Если у пользователя есть связанный Telegram аккаунт, возвращаем его данные
    let telegramData = null;
    if (user.linked_telegram_id) {
      const telegramUser = await getUserByTelegramId(user.linked_telegram_id);
      if (telegramUser) {
        telegramData = {
          telegram_id: telegramUser.telegram_id,
          telegram_username: telegramUser.telegram_username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name
        };
      }
    }

    // Обновляем статистику входа
    await updateLoginStats(user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        referralCode: user.referral_code,
        telegramData
      }
    });
  } catch (error) {
    next(error);
  }
}

async function handleLinkTelegramAccount(req, res, next) {
  try {
    const { userId, telegramInitData } = req.body;
    
    // Импортируем здесь, чтобы избежать циклических зависимостей
    const { validateTelegramInitData } = require('../services/telegramService.cjs');
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      throw new UnauthorizedError('Bot token not configured');
    }
    
    const validatedData = validateTelegramInitData(telegramInitData, botToken);
    
    if (!validatedData || !validatedData.user) {
      throw new UnauthorizedError('Invalid Telegram data');
    }

    const telegramUser = validatedData.user;
    
    // Связываем аккаунты
    await linkAccounts(userId, telegramUser.id);

    res.json({
      success: true,
      message: 'Telegram account linked successfully'
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

    const user = await getUserByEmail(email);
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Генерируем одноразовый пароль
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Сохраняем OTP в базе данных
    await saveOTP(user.id, otp, otpExpiry);

    // Отправляем OTP на email
    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    next(error);
  }
}

async function handleVerifyOTP(req, res, next) {
  try {
    const { email, otp } = req.body;

    const user = await getUserByEmail(email);
    if (!user) {
      throw new ValidationError('User not found');
    }

    const isValidOTP = await verifyOTP(user.id, otp);
    if (!isValidOTP) {
      throw new ValidationError('Invalid or expired OTP');
    }

    // Удаляем использованный OTP
    await deleteOTP(user.id);

    // Обновляем статистику входа
    await updateLoginStats(user.id);

    // Возвращаем токен для входа
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        referralCode: user.referral_code
      }
    });
  } catch (error) {
    next(error);
  }
}

// Вспомогательная функция для обновления статистики входа
async function updateLoginStats(userId) {
  const { pool } = require('../config/database.cjs');
  
  const query = `
    INSERT INTO user_stats (user_id, total_logins, last_login_at)
    VALUES ($1, 1, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      total_logins = user_stats.total_logins + 1,
      last_login_at = NOW()
  `;
  
  await pool.query(query, [userId]);
}

// Вспомогательная функция для отправки email с подтверждением
async function sendVerificationEmail(email, userId) {
  // В реальном приложении здесь будет отправка email с подтверждающей ссылкой
  log.info(`Verification email would be sent to ${email} with userId ${userId}`);
}

// Вспомогательная функция для отправки OTP
async function sendOTPEmail(email, otp) {
  // В реальном приложении здесь будет отправка email с OTP
  log.info(`OTP ${otp} would be sent to ${email}`);
}

module.exports = {
  handleEmailRegistration,
  handleEmailLogin,
  handleLinkTelegramAccount,
  handleSendOTP,
  handleVerifyOTP
};