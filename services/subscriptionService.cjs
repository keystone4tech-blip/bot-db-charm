const pool = require('../config/database.cjs');;
const { SUBSCRIPTION_STATUS } = require('../config/constants.cjs');;

async function getUserSubscriptions(userId, status = SUBSCRIPTION_STATUS.ACTIVE) {
  const query = 'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2';
  const result = await pool.query(query, [userId, status]);
  return result.rows;
}

async function createSubscription(subscriptionData) {
  const { user_id, plan_name, price, duration_days, status } = subscriptionData;
  
  const query = `
    INSERT INTO subscriptions (user_id, plan_name, price, duration_days, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await pool.query(query, [
    user_id,
    plan_name,
    price,
    duration_days,
    status || SUBSCRIPTION_STATUS.ACTIVE
  ]);
  
  return result.rows[0];
}

module.exports = {
  getUserSubscriptions,
  createSubscription,
};
