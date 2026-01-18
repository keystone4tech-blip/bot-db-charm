const log = require('../utils/logger.cjs');;
const { AppError } = require('../utils/errors.cjs');;

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      success: false,
    });
  }

  log.error('Unexpected error:', err);

  res.status(500).json({
    error: err.message || 'Internal server error',
    success: false,
  });
}

module.exports = errorHandler;
