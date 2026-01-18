const pool = require('../config/database.cjs');;
const { NotFoundError } = require('../utils/errors.cjs');;

async function getBalance(userId) {
  const query = 'SELECT * FROM balances WHERE user_id = $1';
  const result = await pool.query(query, [userId]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Balance not found');;
  }

  return result.rows[0];
}

async function updateBalance(userId, balanceData) {
  const { internal_balance, external_balance, total_earned, total_withdrawn } = balanceData;
  
  const query = `
    UPDATE balances
    SET 
      internal_balance = COALESCE($1, internal_balance),
      external_balance = COALESCE($2, external_balance),
      total_earned = COALESCE($3, total_earned),
      total_withdrawn = COALESCE($4, total_withdrawn),
      updated_at = NOW()
    WHERE user_id = $5
    RETURNING *
  `;
  
  const result = await pool.query(query, [
    internal_balance,
    external_balance,
    total_earned,
    total_withdrawn,
    userId
  ]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Balance not found');;
  }

  return result.rows[0];
}

module.exports = {
  getBalance,
  updateBalance,
};
