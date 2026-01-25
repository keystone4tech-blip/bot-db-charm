const { getVPNServers } = require('../services/vpnServerService.cjs');;

async function handleGetVPNServers(req, res, next) {
  try {
    const servers = await getVPNServers();

    res.json({
      success: true,
      servers,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetVPNServers,
};