#!/bin/bash

# Упрощенный установочный скрипт для быстрого запуска
# Использование: curl -sSL https://raw.githubusercontent.com/keystone4tech-blip/bot-db-charm/main/quick-install.sh | bash

set -e

echo "🚀 Установка Keystone Bot (быстрая версия)..."

# Проверяем зависимости
command -v git >/dev/null 2>&1 || { echo >&2 "Требуется git, но оно не установлено. Выход."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo >&2 "Требуется docker, но оно не установлено. Выход."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo >&2 "Требуется docker-compose, но оно не установлено. Выход."; exit 1; }

# Создаем директорию проекта
PROJECT_DIR="/home/deploy/keystone-bot"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Клонируем репозиторий
if [ ! -d "$PROJECT_DIR/.git" ]; then
    git clone https://github.com/keystone4tech-blip/bot-db-charm.git $PROJECT_DIR
else
    cd $PROJECT_DIR
    git pull origin main
fi

# Переходим в директорию проекта
cd $PROJECT_DIR

# Запускаем проект через Docker Compose
docker-compose up -d

echo "✅ Keystone Bot успешно установлен и запущен!"
echo "📋 Проверить статус: docker-compose ps"
echo "📋 Проверить логи: docker-compose logs -f"
echo "📋 Остановить: docker-compose down"