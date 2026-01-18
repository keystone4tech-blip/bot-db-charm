const { getBalance, updateBalance } = require('../services/balanceService.cjs');;

async function handleGetBalance(req, res, next) {
  try {
    const { userId } = req.params;
    const balance = await getBalance(userId);

    res.json({
      success: true,
      balance,
    });
  } catch (error) {
    next(error);
  }
}

async function handleUpdateBalance(req, res, next) {
  try {
    const { userId } = req.params;
    const balanceData = req.body;

    const balance = await updateBalance(userId, balanceData);

    res.json({
      success: true,
      balance,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetBalance,
  handleUpdateBalance,
};
