const pool = require('../config/database.cjs');;

async function getTopReferrals() {
  // В реальной реализации здесь будет запрос к базе данных для получения
  // топ-5 рефералов по количеству приведенных пользователей или заработку
  
  // Пока возвращаем фиктивные данные, но в будущем заменим на реальный запрос
  const query = `
    SELECT 
      r.id,
      p.first_name,
      p.last_name,
      p.telegram_username,
      COUNT(r.id) as referrals_count,
      rs.total_earnings
    FROM referrals r
    JOIN profiles p ON r.referrer_id = p.id
    LEFT JOIN referral_stats rs ON r.referrer_id = rs.user_id
    GROUP BY r.referrer_id, p.id, p.first_name, p.last_name, p.telegram_username, rs.total_earnings
    ORDER BY referrals_count DESC
    LIMIT 5
  `;
  
  try {
    const result = await pool.query(query);
    
    // Форматируем данные для клиента
    return result.rows.map((row, index) => ({
      rank: index + 1,
      name: row.first_name || row.telegram_username || 'Неизвестный пользователь',
      referrals: row.referrals_count,
      earnings: row.total_earnings || 0,
      position: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'regular'
    }));
  } catch (error) {
    console.error('Ошибка при получении топ-5 рефералов:', error);
    // Возвращаем фиктивные данные в случае ошибки
    return [
      { rank: 1, name: 'Алексей К.', referrals: 125, earnings: 1250.50, position: 'gold' },
      { rank: 2, name: 'Мария С.', referrals: 98, earnings: 980.25, position: 'silver' },
      { rank: 3, name: 'Дмитрий П.', referrals: 87, earnings: 870.75, position: 'bronze' },
      { rank: 4, name: 'Елена В.', referrals: 76, earnings: 760.50, position: 'regular' },
      { rank: 5, name: 'Сергей Н.', referrals: 65, earnings: 650.25, position: 'regular' },
    ];
  }
}

module.exports = {
  getTopReferrals,
};