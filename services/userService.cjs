const pool = require('../config/database.cjs');;
const log = require('../utils/logger.cjs');;
const { NotFoundError } = require('../utils/errors.cjs');;
const { DEFAULT_USER_ROLE, DEFAULT_BALANCE, DEFAULT_REFERRAL_STATS, ADMIN_ID } = require('../config/constants.cjs');;
const { generateReferralCode, findReferrerByCode, createReferralRelationship, getProfileByReferralCode } = require('./referralService.cjs');

async function getUserByTelegramId(telegramId) {
  // Сначала ищем по telegram_id
  let query = 'SELECT * FROM profiles WHERE telegram_id = $1';
  let result = await pool.query(query, [telegramId]);

  if (result.rows.length > 0) {
    return result.rows[0];
  }

  // Если не найден, ищем по linked_telegram_id
  query = 'SELECT * FROM profiles WHERE linked_telegram_id = $1';
  result = await pool.query(query, [telegramId]);

  return result.rows[0] || null;
}

async function getUserByEmail(email) {
  const query = 'SELECT * FROM profiles WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}

async function getUserById(userId) {
  const query = 'SELECT * FROM profiles WHERE id = $1';
  const result = await pool.query(query, [userId]);

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');;
  }

  return result.rows[0];
}

async function createProfile(telegramUser, referralCode = null, referredBy = null) {
  log.info('Creating new profile for Telegram user:', telegramUser.id);

  // Determine referrer: explicit referral code, explicit referredBy, or null (will be admin or none)
  let referrerId = null;

  if (referralCode) {
    // Try to find referrer by code
    referrerId = await findReferrerByCode(referralCode);
    if (referrerId) {
      log.info('Found referrer by code:', referrerId);
    }
  } else if (referredBy) {
    // Use explicit referredBy
    referrerId = referredBy;
  } else {
    // No referral - will be handled as admin case in the bot
    log.info('No referral code provided, user will be attached to admin or none');
  }

  const newReferralCode = generateReferralCode(telegramUser.id);

  const createProfileQuery = `
    INSERT INTO profiles (
      telegram_id, telegram_username, first_name, last_name,
      avatar_url, referral_code, referred_by, auth_method
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const createProfileResult = await pool.query(createProfileQuery, [
    telegramUser.id,
    telegramUser.username || null,
    telegramUser.first_name || null,
    telegramUser.last_name || null,
    telegramUser.photo_url || null,
    newReferralCode,
    referrerId,
    'telegram'
  ]);

  const profile = createProfileResult.rows[0];
  log.info('Profile created:', profile.id);

  await createBalanceRecord(profile.id);
  await createUserStatsRecord(profile.id);
  await createReferralStatsRecord(profile.id);
  await createUserRoleRecord(profile.id);

  if (referrerId) {
    await createReferralRelationship(referrerId, profile.id);
  }

  return profile;
}

async function createEmailUser(userData) {
  const {
    email,
    passwordHash,
    firstName,
    lastName,
    referralCode,
    referralCodeInput
  } = userData;

  // Проверяем реферальный код
  let referredBy = null;
  if (referralCodeInput) {
    const referrer = await getProfileByReferralCode(referralCodeInput);
    if (referrer) {
      referredBy = referrer.id;
    }
  }

  const query = `
    INSERT INTO profiles (
      email,
      password_hash,
      first_name,
      last_name,
      referral_code,
      referred_by,
      auth_method
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const result = await pool.query(query, [
    email,
    passwordHash,
    firstName,
    lastName,
    referralCode,
    referredBy,
    'email'
  ]);

  // Создаем записи в связанных таблицах
  await createBalanceRecord(result.rows[0].id);
  await createUserStatsRecord(result.rows[0].id);
  await createReferralStatsRecord(result.rows[0].id);
  await createUserRoleRecord(result.rows[0].id);

  return result.rows[0];
}

async function createBalanceRecord(userId) {
  const query = `
    INSERT INTO balances (user_id, internal_balance, external_balance, total_earned, total_withdrawn)
    VALUES ($1, $2, $3, $4, $5)
  `;
  await pool.query(query, [
    userId,
    DEFAULT_BALANCE.internal_balance,
    DEFAULT_BALANCE.external_balance,
    DEFAULT_BALANCE.total_earned,
    DEFAULT_BALANCE.total_withdrawn
  ]);
}

async function createUserStatsRecord(userId) {
  const query = `
    INSERT INTO user_stats (user_id, total_logins, last_login_at)
    VALUES ($1, $2, $3)
  `;
  await pool.query(query, [userId, 1, new Date().toISOString()]);
}

async function createReferralStatsRecord(userId) {
  const query = `
    INSERT INTO referral_stats (user_id, total_referrals, total_earnings)
    VALUES ($1, $2, $3)
  `;
  await pool.query(query, [
    userId,
    DEFAULT_REFERRAL_STATS.total_referrals,
    DEFAULT_REFERRAL_STATS.total_earnings
  ]);
}

async function createUserRoleRecord(userId, role = DEFAULT_USER_ROLE) {
  const query = `
    INSERT INTO user_roles (user_id, role)
    VALUES ($1, $2)
  `;
  await pool.query(query, [userId, role]);
}

async function updateProfile(userId, updateData) {
  const { first_name, last_name, avatar_url, telegram_username, email } = updateData;

  const query = `
    UPDATE profiles
    SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      avatar_url = COALESCE($3, avatar_url),
      telegram_username = COALESCE($4, telegram_username),
      email = COALESCE($5, email),
      updated_at = NOW()
    WHERE id = $6
    RETURNING *
  `;

  const result = await pool.query(query, [
    first_name,
    last_name,
    avatar_url,
    telegram_username,
    email,
    userId
  ]);

  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');;
  }

  return result.rows[0];
}

async function updateExistingUserProfile(profile, telegramUser) {
  log.info('Existing user logged in:', profile.id);

  const updateProfileQuery = `
    UPDATE profiles
    SET telegram_username = $1, first_name = $2, last_name = $3,
        avatar_url = COALESCE($4, avatar_url), updated_at = $5
    WHERE id = $6
  `;
  await pool.query(updateProfileQuery, [
    telegramUser.username || null,
    telegramUser.first_name || null,
    telegramUser.last_name || null,
    telegramUser.photo_url || profile.avatar_url,
    new Date().toISOString(),
    profile.id
  ]);

  const updateUserStatsQuery = `
    UPDATE user_stats
    SET total_logins = total_logins + 1, last_login_at = $1
    WHERE user_id = $2
  `;
  await pool.query(updateUserStatsQuery, [new Date().toISOString(), profile.id]);
}

async function linkAccounts(userId, telegramId) {
  const query = `
    UPDATE profiles
    SET linked_telegram_id = $1
    WHERE id = $2
  `;
  await pool.query(query, [telegramId, userId]);
}

async function saveOTP(userId, otp, expiry) {
  // Сначала удаляем старые OTP для этого пользователя
  await pool.query('DELETE FROM otp_codes WHERE user_id = $1', [userId]);

  // Хешируем OTP для безопасности
  const crypto = require('crypto');
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

  const query = `
    INSERT INTO otp_codes (user_id, otp_hash, expires_at)
    VALUES ($1, $2, $3)
  `;
  await pool.query(query, [userId, otpHash, expiry]);
}

async function verifyOTP(userId, otp) {
  const crypto = require('crypto');
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

  const query = `
    SELECT * FROM otp_codes
    WHERE user_id = $1 AND otp_hash = $2 AND expires_at > NOW()
  `;
  const result = await pool.query(query, [userId, otpHash]);
  return result.rows.length > 0;
}

async function deleteOTP(userId) {
  const query = 'DELETE FROM otp_codes WHERE user_id = $1';
  await pool.query(query, [userId]);
}

async function getUserRole(userId) {
  const query = 'SELECT role FROM user_roles WHERE user_id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows[0]?.role || DEFAULT_USER_ROLE;
}

module.exports = {
  getUserByTelegramId,
  getUserByEmail,
  getUserById,
  createProfile,
  createEmailUser,
  updateProfile,
  updateExistingUserProfile,
  linkAccounts,
  saveOTP,
  verifyOTP,
  deleteOTP,
  getUserRole,
  getProfileByReferralCode, // экспорт для использования в контроллере
};
