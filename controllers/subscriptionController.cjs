const { getUserSubscriptions, createSubscription } = require('../services/subscriptionService.cjs');;

async function handleGetUserSubscriptions(req, res, next) {
  try {
    const { userId } = req.params;
    const subscriptions = await getUserSubscriptions(userId);

    res.json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    next(error);
  }
}

async function handleCreateSubscription(req, res, next) {
  try {
    const subscriptionData = req.body;
    const subscription = await createSubscription(subscriptionData);

    res.json({
      success: true,
      subscription,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetUserSubscriptions,
  handleCreateSubscription,
};
