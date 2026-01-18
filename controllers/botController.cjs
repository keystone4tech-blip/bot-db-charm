const { getUserBots, createBot } = require('../services/botService.cjs');;

async function handleGetUserBots(req, res, next) {
  try {
    const { userId } = req.params;
    const bots = await getUserBots(userId);

    res.json({
      success: true,
      bots,
    });
  } catch (error) {
    next(error);
  }
}

async function handleCreateBot(req, res, next) {
  try {
    const botData = req.body;
    const bot = await createBot(botData);

    res.json({
      success: true,
      bot,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetUserBots,
  handleCreateBot,
};
