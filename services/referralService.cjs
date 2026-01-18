const pool = require('../config/database.cjs');;
const log = require('../utils/logger.cjs');;

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

async function findReferrerByCode(referralCode) {
  if (!referralCode) {
    return null;
  }

  const query = 'SELECT id FROM profiles WHERE referral_code = $1';
  const result = await pool.query(query, [referralCode.toUpperCase()]);
  
  if (result.rows.length > 0) {
    log.info('Found referrer:', result.rows[0].id);
    return result.rows[0].id;
  }
  
  return null;
}

async function createReferralRelationship(referrerId, referredId) {
  const createReferralQuery = `
    INSERT INTO referrals (referrer_id, referred_id, level, is_active)
    VALUES ($1, $2, $3, $4)
  `;
  await pool.query(createReferralQuery, [referrerId, referredId, 1, true]);

  const updateReferrerStatsQuery = `
    UPDATE referral_stats 
    SET total_referrals = total_referrals + 1, level_1_count = level_1_count + 1
    WHERE user_id = $1
  `;
  await pool.query(updateReferrerStatsQuery, [referrerId]);

  log.info('Referral created for:', referrerId);
}

async function getReferralStats(userId) {
  const query = 'SELECT * FROM referral_stats WHERE user_id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
}

module.exports = {
  generateReferralCode,
  findReferrerByCode,
  createReferralRelationship,
  getReferralStats,
};
