const pool = require('../config/database.cjs');
const log = require('../utils/logger.cjs');
const crypto = require('crypto');

/**
 * Generate a 6-digit OTP code
 */
async function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create OTP session for Telegram-based authentication
 */
async function createOTPSession(userId, sessionId, code) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  
  // Hash the OTP code for security
  const otpHash = crypto.createHash('sha256').update(code).digest('hex');
  
  const query = `
    INSERT INTO otp_sessions (
      user_id, session_id, code_hash, expires_at, attempts, max_attempts
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const result = await pool.query(query, [
    userId,
    sessionId,
    otpHash,
    expiresAt,
    0,
    3
  ]);
  
  return result.rows[0];
}

/**
 * Get user by identifier (ID or username)
 */
async function getUserByIdentifier(identifier) {
  let query;
  let params;
  
  // Check if identifier is a number (Telegram ID)
  if (/^\d+$/.test(identifier)) {
    const telegramId = parseInt(identifier);
    query = 'SELECT * FROM profiles WHERE telegram_id = $1 OR linked_telegram_id = $1';
    params = [telegramId];
  } else if (identifier.startsWith('@')) {
    // Username with @ prefix
    const username = identifier.substring(1);
    query = 'SELECT * FROM profiles WHERE telegram_username = $1';
    params = [username];
  } else {
    // Username without @ prefix or email
    query = 'SELECT * FROM profiles WHERE telegram_username = $1 OR email = $1';
    params = [identifier];
  }
  
  const result = await pool.query(query, params);
  return result.rows[0] || null;
}

/**
 * Verify OTP code for Telegram-based authentication
 */
async function verifyOTPCode(sessionId, code) {
  const otpHash = crypto.createHash('sha256').update(code).digest('hex');
  
  const query = `
    SELECT * FROM otp_sessions
    WHERE session_id = $1 AND code_hash = $2 AND expires_at > NOW()
  `;
  
  const result = await pool.query(query, [sessionId, otpHash]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const session = result.rows[0];
  
  // Check if max attempts reached
  if (session.attempts >= session.max_attempts) {
    return null;
  }
  
  return session;
}

/**
 * Increment failed attempts for OTP session
 */
async function incrementOTPAttempts(sessionId) {
  const query = `
    UPDATE otp_sessions
    SET attempts = attempts + 1
    WHERE session_id = $1
    RETURNING *
  `;
  
  const result = await pool.query(query, [sessionId]);
  return result.rows[0];
}

/**
 * Mark OTP session as verified
 */
async function markOTPSessionVerified(sessionId) {
  const query = `
    UPDATE otp_sessions
    SET verified = TRUE
    WHERE session_id = $1
    RETURNING *
  `;
  
  const result = await pool.query(query, [sessionId]);
  return result.rows[0];
}

/**
 * Cleanup expired OTP sessions
 */
async function cleanupExpiredOTPSessions() {
  const query = 'DELETE FROM otp_sessions WHERE expires_at < NOW()';
  const result = await pool.query(query);
  return result.rowCount;
}

/**
 * Get OTP session by session ID
 */
async function getOTPSession(sessionId) {
  const query = 'SELECT * FROM otp_sessions WHERE session_id = $1';
  const result = await pool.query(query, [sessionId]);
  return result.rows[0] || null;
}

module.exports = {
  generateOTP,
  createOTPSession,
  getUserByIdentifier,
  verifyOTPCode,
  incrementOTPAttempts,
  markOTPSessionVerified,
  cleanupExpiredOTPSessions,
  getOTPSession,
};