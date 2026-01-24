const pool = require('../config/database.cjs');
const log = require('../utils/logger.cjs');

async function updateDatabaseStructure() {
  try {
    log.info('Updating database structure for email authentication...');

    // Добавляем новые поля в таблицу profiles
    const alterProfilesQuery = `
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS auth_method VARCHAR(20) DEFAULT 'telegram',
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS linked_telegram_id BIGINT REFERENCES profiles(telegram_id) ON DELETE SET NULL;
    `;

    await pool.query(alterProfilesQuery);
    log.info('profiles table updated successfully');

    // Создаем таблицу для OTP кодов
    const createOTPTableQuery = `
      CREATE TABLE IF NOT EXISTS otp_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON otp_codes(user_id);
      CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
    `;

    await pool.query(createOTPTableQuery);
    log.info('otp_codes table created successfully');

    // Создаем индекс для email
    const createEmailIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;
    `;
    
    await pool.query(createEmailIndexQuery);
    log.info('Email index created successfully');

    // Создаем индекс для linked_telegram_id
    const createLinkedTelegramIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_profiles_linked_telegram_id ON profiles(linked_telegram_id) WHERE linked_telegram_id IS NOT NULL;
    `;
    
    await pool.query(createLinkedTelegramIndexQuery);
    log.info('Linked Telegram ID index created successfully');

    // Create otp_sessions table for Telegram-based OTP authentication
    const createOTPSessionsTableQuery = `
      CREATE TABLE IF NOT EXISTS otp_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        code_hash VARCHAR(255) NOT NULL,
        session_id VARCHAR(32) UNIQUE NOT NULL,
        attempts INT DEFAULT 0,
        max_attempts INT DEFAULT 3,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_otp_sessions_session_id ON otp_sessions(session_id);
      CREATE INDEX IF NOT EXISTS idx_otp_sessions_user_id ON otp_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_otp_sessions_expires_at ON otp_sessions(expires_at);
    `;

    await pool.query(createOTPSessionsTableQuery);
    log.info('otp_sessions table created successfully');

    log.info('Database structure updated successfully');
  } catch (error) {
    log.error('Error updating database structure:', error);
    throw error;
  }
}

module.exports = {
  updateDatabaseStructure,
};