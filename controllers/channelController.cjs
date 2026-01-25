const { getUserChannels, createChannel, getRecommendedChannels } = require('../services/channelService.cjs');;

async function handleGetUserChannels(req, res, next) {
  try {
    const { userId } = req.params;
    const channels = await getUserChannels(userId);

    res.json({
      success: true,
      channels,
    });
  } catch (error) {
    next(error);
  }
}

async function handleCreateChannel(req, res, next) {
  try {
    const channelData = req.body;
    const channel = await createChannel(channelData);

    res.json({
      success: true,
      channel,
    });
  } catch (error) {
    next(error);
  }
}

async function handleGetRecommendedChannels(req, res, next) {
  try {
    const channels = await getRecommendedChannels();

    res.json({
      success: true,
      channels,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetUserChannels,
  handleCreateChannel,
  handleGetRecommendedChannels,
};
