const cors = require('cors');

const corsOptions = {
  // Разрешаем все источники для разработки и Telegram WebApp
  origin: (origin, callback) => {
    // В продакшене разрешаем все, так как Telegram WebApp может иметь разные origin
    if (process.env.NODE_ENV === 'production') {
      callback(null, true);
    } else {
      // В разработке тоже разрешаем все
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 часа
};

module.exports = cors(corsOptions);
