const { getUserByTelegramId, updateProfile } = require('../services/userService.cjs');;
const { NotFoundError } = require('../utils/errors.cjs');;

async function handleGetProfile(req, res, next) {
  try {
    const { telegramId } = req.params;
    const profile = await getUserByTelegramId(telegramId);
    
    if (!profile) {
      throw new NotFoundError('User not found');;
    }
    
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function handleUpdateProfile(req, res, next) {
  try {
    const { userId } = req.params;
    const { first_name, last_name, avatar_url } = req.body;

    const profile = await updateProfile(userId, {
      first_name,
      last_name,
      avatar_url,
    });

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetProfile,
  handleUpdateProfile,
};
