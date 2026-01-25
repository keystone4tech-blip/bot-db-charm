const pool = require('../config/database.cjs');;

async function getUserChannels(userId) {
  const query = 'SELECT * FROM channels WHERE user_id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows;
}

async function createChannel(channelData) {
  const { user_id, channel_name, channel_id, subscriber_count, description } = channelData;

  const query = `
    INSERT INTO channels (user_id, channel_name, channel_id, subscriber_count, description)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const result = await pool.query(query, [
    user_id,
    channel_name,
    channel_id,
    subscriber_count || 0,
    description || null
  ]);

  return result.rows[0];
}

async function getRecommendedChannels() {
  // В реальной реализации здесь будет запрос к базе данных для получения
  // рекомендованных каналов, возможно с фильтрацией по популярности, тематике и т.д.

  // Пока возвращаем фиктивные данные, но в будущем заменим на реальный запрос
  const query = `
    SELECT * FROM channels
    WHERE is_verified = true
    ORDER BY subscriber_count DESC
    LIMIT 15
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Ошибка при получении рекомендованных каналов:', error);
    // Возвращаем фиктивные данные в случае ошибки
    return [
      {
        id: 'rec1',
        name: 'Tech News Daily',
        username: '@technews_daily',
        description: 'Ежедневные новости технологий и IT',
        subscribers: 15000,
        status: 'active',
        joined_at: '2024-01-15T10:30:00Z',
        is_required: true,
        is_referal: true
      },
      {
        id: 'rec2',
        name: 'Crypto Insights',
        username: '@crypto_insights',
        description: 'Анализ криптовалютного рынка',
        subscribers: 8500,
        status: 'active',
        joined_at: '2024-01-20T14:45:00Z',
        is_required: true,
        is_referal: true
      },
      {
        id: 'rec3',
        name: 'AI Trends',
        username: '@ai_trends',
        description: 'Новости и тренды в области ИИ',
        subscribers: 12000,
        status: 'active',
        joined_at: '2024-01-25T09:15:00Z',
        is_required: true,
        is_referal: true
      },
      {
        id: 'rec4',
        name: 'Premium Tech',
        username: '@premium_tech',
        description: 'Эксклюзивные материалы о технологиях',
        subscribers: 25000,
        status: 'active',
        joined_at: '2024-01-10T08:00:00Z',
        is_required: true,
        is_paid: true
      },
      {
        id: 'rec5',
        name: 'Business Insider',
        username: '@business_insider',
        description: 'Бизнес новости и аналитика',
        subscribers: 18500,
        status: 'active',
        joined_at: '2024-01-12T12:15:00Z',
        is_required: true,
        is_paid: true
      }
    ];
  }
}

module.exports = {
  getUserChannels,
  createChannel,
  getRecommendedChannels,
};
