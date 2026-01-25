const {
  getActiveCampaigns,
  getScheduledPosts,
  getWeeklyStats,
} = require('../services/promotionService.cjs');;

async function handleGetActiveCampaigns(req, res, next) {
  try {
    const { userId } = req.params;
    const campaigns = await getActiveCampaigns(userId);

    res.json({
      success: true,
      campaigns,
    });
  } catch (error) {
    next(error);
  }
}

async function handleGetScheduledPosts(req, res, next) {
  try {
    const { userId } = req.params;
    const posts = await getScheduledPosts(userId);

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    next(error);
  }
}

async function handleGetWeeklyStats(req, res, next) {
  try {
    const { userId } = req.params;
    const stats = await getWeeklyStats(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetActiveCampaigns,
  handleGetScheduledPosts,
  handleGetWeeklyStats,
};