const pool = require('../config/database.cjs');;

async function getVPNServers() {
  // Запрос к базе данных для получения информации о доступных VPN-серверах
  const query = `
    SELECT
      id,
      name,
      location,
      country_code,
      flag,
      ping,
      status,
      load,
      protocols,
      ipv6_supported
    FROM vpn_servers
    WHERE is_active = true
    ORDER BY location ASC
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Ошибка при получении VPN-серверов:', error);
    throw error;
  }
}

module.exports = {
  getVPNServers,
};