const pool = require('../config/database.cjs');;

async function getVPNServers() {
  // В реальной реализации здесь будет запрос к базе данных для получения
  // информации о доступных VPN-серверах
  
  // Пока возвращаем фиктивные данные, но в будущем заменим на реальный запрос
  const query = `
    SELECT * FROM vpn_servers 
    WHERE is_active = true 
    ORDER BY location ASC
  `;
  
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Ошибка при получении VPN-серверов:', error);
    // Возвращаем фиктивные данные в случае ошибки
    return [
      {
        id: 'us_ny',
        name: 'США - Нью-Йорк',
        location: 'New York, USA',
        flag: '🇺🇸',
        ping: '12ms',
        status: 'online',
        load: 45,
        protocols: ['OpenVPN', 'WireGuard'],
        ipv6_supported: true
      },
      {
        id: 'de_berlin',
        name: 'Германия - Берлин',
        location: 'Berlin, Germany',
        flag: '🇩🇪',
        ping: '45ms',
        status: 'online',
        load: 23,
        protocols: ['OpenVPN', 'WireGuard'],
        ipv6_supported: true
      },
      {
        id: 'jp_tokyo',
        name: 'Япония - Токио',
        location: 'Tokyo, Japan',
        flag: '🇯🇵',
        ping: '89ms',
        status: 'online',
        load: 67,
        protocols: ['OpenVPN', 'WireGuard'],
        ipv6_supported: false
      },
      {
        id: 'sg_singapore',
        name: 'Сингапур',
        location: 'Singapore',
        flag: '🇸🇬',
        ping: '102ms',
        status: 'online',
        load: 34,
        protocols: ['OpenVPN', 'WireGuard'],
        ipv6_supported: true
      },
      {
        id: 'nl_amsterdam',
        name: 'Нидерланды - Амстердам',
        location: 'Amsterdam, Netherlands',
        flag: '🇳🇱',
        ping: '38ms',
        status: 'online',
        load: 51,
        protocols: ['OpenVPN', 'WireGuard'],
        ipv6_supported: true
      }
    ];
  }
}

module.exports = {
  getVPNServers,
};