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

    // Обновляем структуру базы данных для поддержки email аутентификации
    await updateDatabaseStructure();

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

    // Создаем таблицу для OTP сессий (Telegram-based authentication)
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

    // Проверяем, существует ли таблица vpn_servers
    const vpnServersTableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'vpn_servers'
      ) AS table_exists;
    `;

    const vpnServersTableCheckResult = await pool.query(vpnServersTableExistsQuery);

    if (!vpnServersTableCheckResult.rows[0].table_exists) {
      log.info('vpn_servers table does not exist, creating it...');

      const createVpnServersTableQuery = `
        CREATE TABLE IF NOT EXISTS vpn_servers (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          country_code CHAR(2) NOT NULL,
          flag VARCHAR(10) NOT NULL,
          ping VARCHAR(10),
          status VARCHAR(20) DEFAULT 'online',
          load INTEGER DEFAULT 0,
          protocols TEXT[],
          ipv6_supported BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_vpn_servers_status ON vpn_servers(status);
        CREATE INDEX IF NOT EXISTS idx_vpn_servers_country ON vpn_servers(country_code);
        CREATE INDEX IF NOT EXISTS idx_vpn_servers_location ON vpn_servers(location);

        -- Вставка тестовых данных для VPN-серверов
        INSERT INTO vpn_servers (id, name, location, country_code, flag, ping, status, load, protocols, ipv6_supported) VALUES
        ('us_ny', 'США - Нью-Йорк', 'New York, USA', 'US', '🇺🇸', '12ms', 'online', 45, '{OpenVPN, WireGuard}', true) ON CONFLICT (id) DO NOTHING,
        ('de_berlin', 'Германия - Берлин', 'Berlin, Germany', 'DE', '🇩🇪', '45ms', 'online', 23, '{OpenVPN, WireGuard}', true) ON CONFLICT (id) DO NOTHING,
        ('jp_tokyo', 'Япония - Токио', 'Tokyo, Japan', 'JP', '🇯🇵', '89ms', 'online', 67, '{OpenVPN, WireGuard}', false) ON CONFLICT (id) DO NOTHING,
        ('sg_singapore', 'Сингапур', 'Singapore', 'SG', '🇸🇬', '102ms', 'online', 34, '{OpenVPN, WireGuard}', true) ON CONFLICT (id) DO NOTHING,
        ('nl_amsterdam', 'Нидерланды - Амстердам', 'Amsterdam, Netherlands', 'NL', '🇳🇱', '38ms', 'online', 51, '{OpenVPN, WireGuard}', true) ON CONFLICT (id) DO NOTHING;
      `;

      await pool.query(createVpnServersTableQuery);
      log.info('vpn_servers table created successfully');
    } else {
      log.info('vpn_servers table already exists');
    }

    // Проверяем, существует ли таблица promotion_campaigns
    const promotionCampaignsTableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'promotion_campaigns'
      ) AS table_exists;
    `;

    const promotionCampaignsTableCheckResult = await pool.query(promotionCampaignsTableExistsQuery);

    if (!promotionCampaignsTableCheckResult.rows[0].table_exists) {
      log.info('promotion_campaigns table does not exist, creating it...');

      const createPromotionCampaignsTableQuery = `
        CREATE TABLE IF NOT EXISTS promotion_campaigns (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          campaign_type VARCHAR(50) DEFAULT 'post_promotion',
          status VARCHAR(20) DEFAULT 'draft',
          target_audience TEXT,
          budget DECIMAL(10,2),
          start_date TIMESTAMP,
          end_date TIMESTAMP,
          impressions INTEGER DEFAULT 0,
          conversions INTEGER DEFAULT 0,
          result TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_promotion_campaigns_user_id ON promotion_campaigns(user_id);
        CREATE INDEX IF NOT EXISTS idx_promotion_campaigns_status ON promotion_campaigns(status);
      `;

      await pool.query(createPromotionCampaignsTableQuery);
      log.info('promotion_campaigns table created successfully');
    } else {
      log.info('promotion_campaigns table already exists');
    }

    // Проверяем, существует ли таблица scheduled_posts
    const scheduledPostsTableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'scheduled_posts'
      ) AS table_exists;
    `;

    const scheduledPostsTableCheckResult = await pool.query(scheduledPostsTableExistsQuery);

    if (!scheduledPostsTableCheckResult.rows[0].table_exists) {
      log.info('scheduled_posts table does not exist, creating it...');

      const createScheduledPostsTableQuery = `
        CREATE TABLE IF NOT EXISTS scheduled_posts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          content TEXT,
          scheduled_time TIMESTAMP NOT NULL,
          status VARCHAR(20) DEFAULT 'scheduled',
          channel_id VARCHAR(255),
          posted_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
        CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_time ON scheduled_posts(scheduled_time);
        CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
      `;

      await pool.query(createScheduledPostsTableQuery);
      log.info('scheduled_posts table created successfully');
    } else {
      log.info('scheduled_posts table already exists');
    }

    log.info('Database structure updated successfully');
  } catch (error) {
    log.error('Error updating database structure:', error);
    throw error;
  }
}

async function getPlatformStats() {
  try {
    const stats = {};
    
    const usersCount = await pool.query('SELECT COUNT(*) FROM profiles');
    stats.totalUsers = parseInt(usersCount.rows[0].count);
    
    const botsCount = await pool.query('SELECT COUNT(*) FROM bots WHERE is_active = true');
    stats.activeBots = parseInt(botsCount.rows[0].count);
    
    const subsCount = await pool.query("SELECT COUNT(*) FROM subscriptions WHERE is_active = true");
    stats.activeSubscriptions = parseInt(subsCount.rows[0].count);
    
    const vpnCount = await pool.query('SELECT COUNT(*) FROM vpn_keys WHERE is_active = true');
    stats.activeVpnKeys = parseInt(vpnCount.rows[0].count);
    
    const channelsCount = await pool.query('SELECT COUNT(*) FROM channels');
    stats.activeChannels = parseInt(channelsCount.rows[0].count);
    
    const revenue = await pool.query('SELECT SUM(price) as total FROM subscriptions');
    stats.monthlyRevenue = parseFloat(revenue.rows[0].total || 0);
    
    const balancesCount = await pool.query('SELECT COUNT(*) FROM balances');
    stats.totalTransactions = parseInt(balancesCount.rows[0].count);

    const recentActivityQuery = `
      (SELECT id::text, 'Зарегистрирован' as action, COALESCE(first_name, telegram_id::text) as "user", created_at, 'user' as type FROM profiles ORDER BY created_at DESC LIMIT 5)
      UNION ALL
      (SELECT id::text, 'Создан бот' as action, bot_name as "user", created_at, 'bot' as type FROM bots ORDER BY created_at DESC LIMIT 5)
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const recentActivity = await pool.query(recentActivityQuery);

    return {
      stats,
      recentActivity: recentActivity.rows
    };
  } catch (error) {
    log.error('Error getting platform stats:', error);
    throw error;
  }
}

module.exports = {
  ensureTablesExist,
  getPlatformStats,
};
