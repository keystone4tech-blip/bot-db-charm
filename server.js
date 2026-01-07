// Backend сервер для работы с PostgreSQL базой данных напрямую
const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const cors = require('cors');

// Создаем Express приложение
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для обработки JSON и CORS
app.use(cors());
app.use(express.json());

// Настройка пула подключения к PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'keystone',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Функция для валидации данных Telegram
function validateTelegramInitData(initData, botToken) {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      console.error('No hash in initData');
      return null;
    }
    
    // Remove hash from params for validation
    params.delete('hash');
    
    // Sort parameters and create data check string
    const dataCheckArr = [];
    params.sort();
    params.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    const dataCheckString = dataCheckArr.join('\n');
    
    // Create secret key using HMAC-SHA256
    const secretKey = crypto
      .createHmac('sha256', crypto.createHash('sha256').update('WebAppData').digest())
      .update(botToken)
      .digest();
    
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    if (calculatedHash !== hash.toLowerCase()) {
      console.error('Hash mismatch:', { calculated: calculatedHash, received: hash.toLowerCase() });
      return null;
    }
    
    // Check auth_date (allow 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0');
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      console.error('Auth data expired');
      return null;
    }
    
    // Parse user data
    const userStr = params.get('user');
    if (!userStr) {
      console.error('No user in initData');
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
    console.error('Error validating initData:', error);
    return null;
  }
}

// Функция для генерации реферального кода
function generateReferralCode(telegramId) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const seed = telegramId.toString();
  for (let i = 0; i < 8; i++) {
    const charIndex = (parseInt(seed[i % seed.length]) + i * 7) % chars.length;
    code += chars[charIndex];
  }
  return code;
}

// API маршрут для аутентификации через Telegram
app.post('/api/telegram-auth', async (req, res) => {
  try {
    const { initData, referralCode } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'initData is required' });
    }

    // Получаем токен бота из переменных окружения
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    console.log('Validating Telegram initData...');

    // Валидируем данные Telegram
    const validatedData = validateTelegramInitData(initData, botToken);

    if (!validatedData || !validatedData.user) {
      return res.status(401).json({ error: 'Invalid Telegram data' });
    }

    const telegramUser = validatedData.user;
    console.log('Telegram user validated:', telegramUser.id, telegramUser.first_name);

    // Проверяем, существует ли пользователь
    const existingProfileQuery = 'SELECT * FROM profiles WHERE telegram_id = $1';
    const existingProfileResult = await pool.query(existingProfileQuery, [telegramUser.id]);

    let profile = existingProfileResult.rows[0];

    if (!profile) {
      console.log('Creating new profile for Telegram user:', telegramUser.id);
      
      // Находим реферера, если предоставлен реферальный код
      let referrerId = null;
      if (referralCode) {
        const referrerQuery = 'SELECT id FROM profiles WHERE referral_code = $1';
        const referrerResult = await pool.query(referrerQuery, [referralCode.toUpperCase()]);
        
        if (referrerResult.rows.length > 0) {
          referrerId = referrerResult.rows[0].id;
          console.log('Found referrer:', referrerId);
        }
      }

      // Генерируем уникальный реферальный код для нового пользователя
      const newReferralCode = generateReferralCode(telegramUser.id);

      // Создаем профиль
      const createProfileQuery = `
        INSERT INTO profiles (
          telegram_id, telegram_username, first_name, last_name, 
          avatar_url, referral_code, referred_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const createProfileResult = await pool.query(createProfileQuery, [
        telegramUser.id,
        telegramUser.username || null,
        telegramUser.first_name || null,
        telegramUser.last_name || null,
        telegramUser.photo_url || null,
        newReferralCode,
        referrerId
      ]);

      profile = createProfileResult.rows[0];
      console.log('Profile created:', profile.id);

      // Создаем запись баланса
      const createBalanceQuery = `
        INSERT INTO balances (user_id, internal_balance, external_balance, total_earned, total_withdrawn)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await pool.query(createBalanceQuery, [profile.id, 0, 0, 0, 0]);

      // Создаем запись статистики пользователя
      const createUserStatsQuery = `
        INSERT INTO user_stats (user_id, total_logins, last_login_at)
        VALUES ($1, $2, $3)
      `;
      await pool.query(createUserStatsQuery, [profile.id, 1, new Date().toISOString()]);

      // Создаем запись статистики по рефералам
      const createReferralStatsQuery = `
        INSERT INTO referral_stats (user_id, total_referrals, total_earnings)
        VALUES ($1, $2, $3)
      `;
      await pool.query(createReferralStatsQuery, [profile.id, 0, 0]);

      // Создаем запись роли пользователя
      const createUserRoleQuery = `
        INSERT INTO user_roles (user_id, role)
        VALUES ($1, $2)
      `;
      await pool.query(createUserRoleQuery, [profile.id, 'user']);

      // Если пользователь был приглашен, создаем запись о реферале
      if (referrerId) {
        // Создаем прямую реферальную связь (уровень 1)
        const createReferralQuery = `
          INSERT INTO referrals (referrer_id, referred_id, level, is_active)
          VALUES ($1, $2, $3, $4)
        `;
        await pool.query(createReferralQuery, [referrerId, profile.id, 1, true]);

        // Обновляем статистику реферала у пригласившего
        const updateReferrerStatsQuery = `
          UPDATE referral_stats 
          SET total_referrals = total_referrals + 1, level_1_count = level_1_count + 1
          WHERE user_id = $1
        `;
        await pool.query(updateReferrerStatsQuery, [referrerId]);

        console.log('Referral created for:', referrerId);
      }
    } else {
      console.log('Existing user logged in:', profile.id);
      
      // Обновляем информацию о пользователе
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

      // Обновляем статистику входа
      const updateUserStatsQuery = `
        UPDATE user_stats
        SET total_logins = total_logins + 1, last_login_at = $1
        WHERE user_id = $2
      `;
      await pool.query(updateUserStatsQuery, [new Date().toISOString(), profile.id]);
    }

    // Получаем баланс пользователя
    const balanceQuery = 'SELECT * FROM balances WHERE user_id = $1';
    const balanceResult = await pool.query(balanceQuery, [profile.id]);
    const balance = balanceResult.rows[0];

    // Получаем статистику по рефералам
    const referralStatsQuery = 'SELECT * FROM referral_stats WHERE user_id = $1';
    const referralStatsResult = await pool.query(referralStatsQuery, [profile.id]);
    const referralStats = referralStatsResult.rows[0];

    // Получаем роль пользователя
    const userRoleQuery = 'SELECT role FROM user_roles WHERE user_id = $1';
    const userRoleResult = await pool.query(userRoleQuery, [profile.id]);
    const userRole = userRoleResult.rows[0];

    console.log('Auth successful for user:', profile.id);

    res.json({
      success: true,
      profile,
      balance,
      referralStats,
      role: userRole?.role || 'user',
    });
  } catch (error) {
    console.error('Error in telegram-auth:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Маршрут для получения профиля пользователя
app.get('/api/profiles/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    const query = 'SELECT * FROM profiles WHERE telegram_id = $1';
    const result = await pool.query(query, [telegramId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Маршрут для получения баланса пользователя
app.get('/api/balances/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = 'SELECT * FROM balances WHERE user_id = $1';
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Balance not found' });
    }

    res.json({
      success: true,
      balance: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Маршрут для получения статистики рефералов
app.get('/api/referral-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = 'SELECT * FROM referral_stats WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Referral stats not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Маршрут для регистрации пользователя (для бота)
app.post('/api/users/register', async (req, res) => {
  try {
    const { telegram_id, first_name, last_name, username, avatar_url, referral_code } = req.body;

    if (!telegram_id || !first_name) {
      return res.status(400).json({ error: 'telegram_id and first_name are required' });
    }

    // Проверяем, существует ли пользователь
    const existingProfileQuery = 'SELECT * FROM profiles WHERE telegram_id = $1';
    const existingProfileResult = await pool.query(existingProfileQuery, [telegram_id]);

    let profile = existingProfileResult.rows[0];

    if (!profile) {
      console.log('Creating new profile for Telegram user:', telegram_id);

      // Находим реферера, если предоставлен реферальный код
      let referrerId = null;
      if (referral_code) {
        const referrerQuery = 'SELECT id FROM profiles WHERE referral_code = $1';
        const referrerResult = await pool.query(referrerQuery, [referral_code.toUpperCase()]);

        if (referrerResult.rows.length > 0) {
          referrerId = referrerResult.rows[0].id;
          console.log('Found referrer:', referrerId);
        }
      }

      // Генерируем уникальный реферальный код для нового пользователя
      const newReferralCode = generateReferralCode(telegram_id);

      // Создаем профиль
      const createProfileQuery = `
        INSERT INTO profiles (
          telegram_id, telegram_username, first_name, last_name,
          avatar_url, referral_code, referred_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const createProfileResult = await pool.query(createProfileQuery, [
        telegram_id,
        username || null,
        first_name || null,
        last_name || null,
        avatar_url || null,
        newReferralCode,
        referrerId
      ]);

      profile = createProfileResult.rows[0];
      console.log('Profile created:', profile.id);

      // Создаем запись баланса
      const createBalanceQuery = `
        INSERT INTO balances (user_id, internal_balance, external_balance, total_earned, total_withdrawn)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await pool.query(createBalanceQuery, [profile.id, 0, 0, 0, 0]);

      // Создаем запись статистики пользователя
      const createUserStatsQuery = `
        INSERT INTO user_stats (user_id, total_logins, last_login_at)
        VALUES ($1, $2, $3)
      `;
      await pool.query(createUserStatsQuery, [profile.id, 1, new Date().toISOString()]);

      // Создаем запись статистики по рефералам
      const createReferralStatsQuery = `
        INSERT INTO referral_stats (user_id, total_referrals, total_earnings)
        VALUES ($1, $2, $3)
      `;
      await pool.query(createReferralStatsQuery, [profile.id, 0, 0]);

      // Создаем запись роли пользователя
      const createUserRoleQuery = `
        INSERT INTO user_roles (user_id, role)
        VALUES ($1, $2)
      `;
      await pool.query(createUserRoleQuery, [profile.id, 'user']);

      // Если пользователь был приглашен, создаем запись о реферале
      if (referrerId) {
        // Создаем прямую реферальную связь (уровень 1)
        const createReferralQuery = `
          INSERT INTO referrals (referrer_id, referred_id, level, is_active)
          VALUES ($1, $2, $3, $4)
        `;
        await pool.query(createReferralQuery, [referrerId, profile.id, 1, true]);

        // Обновляем статистику реферала у пригласившего
        const updateReferrerStatsQuery = `
          UPDATE referral_stats
          SET total_referrals = total_referrals + 1, level_1_count = level_1_count + 1
          WHERE user_id = $1
        `;
        await pool.query(updateReferrerStatsQuery, [referrerId]);

        console.log('Referral created for:', referrerId);
      }
    } else {
      console.log('User already exists:', profile.id);
      // Return existing profile
    }

    // Возвращаем профиль в формате, совместимом с ожидаемым форматом asyncpg
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
    console.error('Error in user registration:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Маршрут для получения пользователя по telegram_id (для бота)
app.get('/api/users/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;

    const query = 'SELECT * FROM profiles WHERE telegram_id = $1';
    const result = await pool.query(query, [telegramId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Возвращаем профиль в формате, совместимом с ожидаемым форматом asyncpg
    res.json({
      success: true,
      profile: {
        id: result.rows[0].id,
        telegram_id: result.rows[0].telegram_id,
        telegram_username: result.rows[0].telegram_username,
        first_name: result.rows[0].first_name,
        last_name: result.rows[0].last_name,
        avatar_url: result.rows[0].avatar_url,
        referral_code: result.rows[0].referral_code,
        referred_by: result.rows[0].referred_by,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Маршрут для получения VPN ключей пользователя
app.get('/api/vpn-keys/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = 'SELECT * FROM vpn_keys WHERE user_id = $1';
    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      vpnKeys: result.rows,
    });
  } catch (error) {
    console.error('Error fetching vpn keys:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Маршрут для получения телеграм каналов пользователя
app.get('/api/telegram-channels/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = 'SELECT * FROM telegram_channels WHERE user_id = $1';
    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      channels: result.rows,
    });
  } catch (error) {
    console.error('Error fetching telegram channels:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Маршрут для получения ботов пользователя
app.get('/api/user-bots/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = 'SELECT * FROM user_bots WHERE user_id = $1';
    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      bots: result.rows,
    });
  } catch (error) {
    console.error('Error fetching user bots:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Маршрут для получения подписок пользователя
app.get('/api/subscriptions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = 'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2';
    const result = await pool.query(query, [userId, 'active']);

    res.json({
      success: true,
      subscriptions: result.rows,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Маршрут для обновления профиля пользователя
app.put('/api/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { first_name, last_name, avatar_url } = req.body;

    const query = `
      UPDATE profiles
      SET first_name = $1, last_name = $2, avatar_url = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [first_name, last_name, avatar_url, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Маршрут для создания тикета в поддержку
app.post('/api/support-tickets', async (req, res) => {
  try {
    const { user_id, category, subject, message } = req.body;

    const query = `
      INSERT INTO support_tickets (user_id, category, subject, message, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [user_id, category, subject, message, 'open']);

    res.json({
      success: true,
      ticket: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Экспортируем app для использования в других модулях (например, для тестирования)
module.exports = app;