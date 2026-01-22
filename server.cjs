require('dotenv').config();

const app = require('./app.cjs');
const { ensureTablesExist } = require('./services/databaseService.cjs');
const log = require('./utils/logger.cjs');

const PORT = process.env.PORT || 3000;

ensureTablesExist()
  .then(() => {
    app.listen(PORT, () => {
      log.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    log.error('Failed to ensure tables exist:', error);
    process.exit(1);
  });

module.exports = app;
