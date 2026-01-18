const pool = require('../config/database.cjs');;

async function getUserChannels(userId) {
  const query = 'SELECT * FROM telegram_channels WHERE user_id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows;
}

async function createChannel(channelData) {
  const { user_id, channel_name, channel_id, subscriber_count, description } = channelData;
  
  const query = `
    INSERT INTO telegram_channels (user_id, channel_name, channel_id, subscriber_count, description)
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

module.exports = {
  getUserChannels,
  createChannel,
};
