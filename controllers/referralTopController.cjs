const { getTopReferrals } = require('../services/referralTopService.cjs');;

async function handleGetTopReferrals(req, res, next) {
  try {
    const referrals = await getTopReferrals();

    res.json({
      success: true,
      referrals,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetTopReferrals,
};