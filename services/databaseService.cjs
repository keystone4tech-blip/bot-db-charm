const pool = require('../config/database.cjs');;
const log = require('../utils/logger.cjs');;

async function ensureTablesExist() {
  try {
    log.info('Checking if required tables exist...');;

    const profilesTableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
      ) AS table_exists;
    `;

    const profilesTableCheckResult = await pool.query(profilesTableExistsQuery);

    if (!profilesTableCheckResult.rows[0].table_exists) {
      log.info('profiles table does not exist, creating it...');;

      const createProfilesTableQuery = `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          telegram_id BIGINT UNIQUE NOT NULL,
          telegram_username VARCHAR(255),
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255),
          avatar_url TEXT,
          referral_code VARCHAR(50) UNIQUE,
          referred_by UUID REFERENCES profiles(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON profiles(telegram_id);
        CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
      `;

      await pool.query(createProfilesTableQuery);
      log.info('profiles table created successfully');;
    } else {
      log.info('profiles table already exists');;
    }

    const supportTicketsTableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'support_tickets'
      ) AS table_exists;
    `;

    const supportTicketsTableCheckResult = await pool.query(supportTicketsTableExistsQuery);

    if (!supportTicketsTableCheckResult.rows[0].table_exists) {
      log.info('support_tickets table does not exist, creating it...');;

      const createSupportTicketsTableQuery = `
        CREATE TABLE IF NOT EXISTS support_tickets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          category VARCHAR(100) NOT NULL,
          subject VARCHAR(255),
          message TEXT NOT NULL,
          status VARCHAR(20) DEFAULT 'open',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON support_tickets(user_id);
      `;

      await pool.query(createSupportTicketsTableQuery);
      log.info('support_tickets table created successfully');;
    } else {
      log.info('support_tickets table already exists');;
    }
  } catch (error) {
    log.error('Error ensuring tables exist:', error);
    throw error;
  }
}

module.exports = {
  ensureTablesExist,
};
