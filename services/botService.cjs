const pool = require('../config/database.cjs');;

async function getUserBots(userId) {
  const query = 'SELECT * FROM bots WHERE user_id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows;
}

async function createBot(botData) {
  const { user_id, bot_name, bot_token, bot_username, description } = botData;
  
  const query = `
    INSERT INTO bots (user_id, bot_name, bot_token, bot_username, description)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await pool.query(query, [
    user_id,
    bot_name,
    bot_token,
    bot_username,
    description || null
  ]);
  
  return result.rows[0];
}

module.exports = {
  getUserBots,
  createBot,
};
