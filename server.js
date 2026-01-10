// Backend сервер для работы с PostgreSQL базой данных напрямую
import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Для корректной работы с ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Проверка подключения к базе данных
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

// Маршрут для проверки состояния сервера
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Маршрут для аутентификации через Telegram
app.post('/api/telegram-auth', async (req, res) => {
  try {
    console.log('=== Received Telegram auth request ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Environment variables check:');
    console.log('- DB_HOST:', process.env.DB_HOST ? 'SET' : 'NOT SET');
    console.log('- DB_NAME:', process.env.DB_NAME ? 'SET' : 'NOT SET');
    console.log('- DB_USER:', process.env.DB_USER ? 'SET' : 'NOT SET');
    console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');

    const { initData, referralCode } = req.body;

    if (!initData) {
      console.log('No initData provided');
      return res.status(400).json({ error: 'initData is required' });
    }

    // Разбор initData
    const params = new URLSearchParams(initData);
    const userParam = params.get('user');
    if (!userParam) {
      console.log('No user data in initData');
      return res.status(400).json({ error: 'User data not found in initData' });
    }

    const user = JSON.parse(decodeURIComponent(userParam));
    console.log('Parsed user data:', { id: user.id, firstName: user.first_name });

    // Проверяем, существует ли пользователь в базе данных
    const existingUserQuery = 'SELECT * FROM profiles WHERE telegram_id = $1';
    const existingUserResult = await pool.query(existingUserQuery, [user.id]);

    let profile;
    if (existingUserResult.rows.length > 0) {
      // Пользователь уже существует, обновляем данные
      console.log('User already exists, updating profile...');
      const updateQuery = `
        UPDATE profiles
        SET telegram_username = $1, first_name = $2, last_name = $3, avatar_url = $4, updated_at = $5
        WHERE telegram_id = $6
        RETURNING *
      `;
      const updateResult = await pool.query(updateQuery, [
        user.username || null,
        user.first_name || null,
        user.last_name || null,
        user.photo_url || null,
        new Date().toISOString(),
        user.id
      ]);
      profile = updateResult.rows[0];
      console.log('Profile updated:', profile.id);
    } else {
      // Создаем нового пользователя
      console.log('Creating new user profile...');
      
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

      // Генерируем уникальный реферальный код
      const referralCode = `REF${user.id}${Date.now()}`.substring(0, 12).toUpperCase();

      const createProfileQuery = `
        INSERT INTO profiles (
          telegram_id, telegram_username, first_name, last_name,
          avatar_url, referral_code, referred_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const createResult = await pool.query(createProfileQuery, [
        user.id,
        user.username || null,
        user.first_name || null,
        user.last_name || null,
        user.photo_url || null,
        referralCode,
        referrerId
      ]);
      profile = createResult.rows[0];
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
    }

    // Получаем баланс пользователя
    const balanceQuery = 'SELECT * FROM balances WHERE user_id = $1';
    const balanceResult = await pool.query(balanceQuery, [profile.id]);
    const balance = balanceResult.rows[0] || {
      internal_balance: 0,
      external_balance: 0,
      total_earned: 0,
      total_withdrawn: 0
    };

    // Получаем статистику по рефералам
    const referralStatsQuery = 'SELECT * FROM referral_stats WHERE user_id = $1';
    const referralStatsResult = await pool.query(referralStatsQuery, [profile.id]);
    const referralStats = referralStatsResult.rows[0] || {
      total_referrals: 0,
      total_earnings: 0,
      level_1_count: 0,
      level_2_count: 0,
      level_3_count: 0,
      level_4_count: 0,
      level_5_count: 0
    };

    // Получаем роль пользователя
    const userRoleQuery = 'SELECT role FROM user_roles WHERE user_id = $1';
    const userRoleResult = await pool.query(userRoleQuery, [profile.id]);
    const role = userRoleResult.rows[0]?.role || 'user';

    console.log('Authentication successful for user:', profile.id);

    res.json({
      success: true,
      profile,
      balance,
      referralStats,
      role,
    });
  } catch (error) {
    console.error('=== ERROR in telegram-auth ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
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

    res.json({
      success: true,
      profile: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
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

    res.json({
      success: true,
      stats: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
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
    console.error('Error fetching VPN keys:', error);
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

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Экспортируем app для использования в других модулях (например, для тестирования)
export default app;