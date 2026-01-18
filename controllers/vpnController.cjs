const { getUserVpnKeys, createVpnKey } = require('../services/vpnService.cjs');;

async function handleGetUserVpnKeys(req, res, next) {
  try {
    const { userId } = req.params;
    const vpnKeys = await getUserVpnKeys(userId);

    res.json({
      success: true,
      vpnKeys,
    });
  } catch (error) {
    next(error);
  }
}

async function handleCreateVpnKey(req, res, next) {
  try {
    const vpnKeyData = req.body;
    const vpnKey = await createVpnKey(vpnKeyData);

    res.json({
      success: true,
      vpnKey,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetUserVpnKeys,
  handleCreateVpnKey,
};
