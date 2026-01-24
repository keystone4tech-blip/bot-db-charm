#!/bin/sh

# Заменяем переменные окружения в index.html и других файлах сборки
# при запуске контейнера

# Заменяем переменные в JS файлах
for js_file in /usr/share/nginx/html/assets/*.js; do
  if [ -f "$js_file" ]; then
    sed -i "s|http://localhost:3000|${VITE_SERVER_BASE_URL:-http://localhost:3000}|g" "$js_file"
    sed -i "s|VITE_TELEGRAM_BOT_USERNAME_PLACEHOLDER|${VITE_TELEGRAM_BOT_USERNAME:-Keystone_Tech_Robot}|g" "$js_file"
  fi
done

# Запускаем nginx
exec nginx -g 'daemon off;'