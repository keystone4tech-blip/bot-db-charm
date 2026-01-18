const pool = require('../config/database.cjs');;

async function getUserVpnKeys(userId) {
  const query = 'SELECT * FROM vpn_keys WHERE user_id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows;
}

async function createVpnKey(vpnKeyData) {
  const { user_id, key_value, server_location, expires_at } = vpnKeyData;
  
  const query = `
    INSERT INTO vpn_keys (user_id, key_value, server_location, expires_at)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  
  const result = await pool.query(query, [
    user_id,
    key_value,
    server_location || null,
    expires_at || null
  ]);
  
  return result.rows[0];
}

module.exports = {
  getUserVpnKeys,
  createVpnKey,
};
