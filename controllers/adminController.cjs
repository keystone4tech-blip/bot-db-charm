const { getPlatformStats } = require('../services/databaseService.cjs');
const { getUserById } = require('../services/userService.cjs');
const { getBalance } = require('../services/balanceService.cjs');
const { getReferralStats } = require('../services/referralService.cjs');
const { getUserSubscriptions } = require('../services/subscriptionService.cjs');
const { getUserVpnKeys } = require('../services/vpnService.cjs');
const { getUserBots } = require('../services/botService.cjs');
const log = require('../utils/logger.cjs');

async function handleGetPlatformStats(req, res, next) {
  try {
    const stats = await getPlatformStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

async function handleGetAdminUserProfile(req, res, next) {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const profile = await getUserById(user_id);
    const balance = await getBalance(user_id);
    const referral_stats = await getReferralStats(user_id);
    const subscriptions = await getUserSubscriptions(user_id);
    const vpn_keys = await getUserVpnKeys(user_id);
    const bots = await getUserBots(user_id);

    res.json({
      profile,
      balance,
      referral_stats,
      subscriptions,
      vpn_keys,
      bots
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetPlatformStats,
  handleGetAdminUserProfile,
};
