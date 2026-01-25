const pool = require('../config/database.cjs');;

// Получение активных кампаний продвижения для пользователя
async function getActiveCampaigns(userId) {
  const query = `
    SELECT 
      id,
      title,
      status,
      created_at as started_at,
      result
    FROM promotion_campaigns 
    WHERE user_id = $1 
    AND status IN ('active', 'pending', 'running')
    ORDER BY created_at DESC
  `;
  
  try {
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      status: row.status,
      startedAt: formatDateAgo(row.created_at),
      result: row.result || 'Ожидание'
    }));
  } catch (error) {
    console.error('Ошибка при получении активных кампаний:', error);
    // Возвращаем пустой массив в случае ошибки
    return [];
  }
}

// Получение запланированных постов для пользователя
async function getScheduledPosts(userId) {
  const query = `
    SELECT 
      id,
      title,
      description,
      scheduled_time
    FROM scheduled_posts 
    WHERE user_id = $1 
    AND status = 'scheduled'
    ORDER BY scheduled_time ASC
    LIMIT 10
  `;
  
  try {
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      time: formatTime(row.scheduled_time)
    }));
  } catch (error) {
    console.error('Ошибка при получении запланированных постов:', error);
    // Возвращаем пустой массив в случае ошибки
    return [];
  }
}

// Получение статистики за неделю для пользователя
async function getWeeklyStats(userId) {
  const query = `
    SELECT 
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as posts_count,
      SUM(impressions) as total_impressions,
      SUM(conversions) as total_conversions
    FROM promotion_campaigns 
    WHERE user_id = $1 
    AND created_at >= NOW() - INTERVAL '7 days'
  `;
  
  try {
    const result = await pool.query(query, [userId]);
    const row = result.rows[0];
    
    return [
      { label: 'Постов', value: row.posts_count || 0 },
      { label: 'Просмотров', value: formatNumber(row.total_impressions || 0) },
      { label: 'Подписчиков', value: '+' + (row.total_conversions || 0) },
    ];
  } catch (error) {
    console.error('Ошибка при получении статистики за неделю:', error);
    // Возвращаем пустой массив в случае ошибки
    return [];
  }
}

// Вспомогательные функции
function formatDateAgo(date) {
  if (!date) return 'Недавно';
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} секунд назад`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} минут назад`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} часов назад`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} дней назад`;
  
  return past.toLocaleDateString('ru-RU');
}

function formatTime(date) {
  if (!date) return 'Неизвестно';
  return new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

module.exports = {
  getActiveCampaigns,
  getScheduledPosts,
  getWeeklyStats,
};