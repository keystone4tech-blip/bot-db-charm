const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);
