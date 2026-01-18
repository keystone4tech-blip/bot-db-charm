const { getReferralStats } = require('../services/referralService.cjs');;
const { NotFoundError } = require('../utils/errors.cjs');;

async function handleGetReferralStats(req, res, next) {
  try {
    const { userId } = req.params;
    const stats = await getReferralStats(userId);
    
    if (!stats) {
      throw new NotFoundError('Referral stats not found');;
    }
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetReferralStats,
};
