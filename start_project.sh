#!/bin/bash

# Скрипт для автоматического запуска проекта
# Запуск: ./start_project.sh

set -e

echo "🚀 Запуск проекта Keystone Bot..."

PROJECT_DIR="/home/deploy/keystone-bot"

# Проверяем, существует ли проект
if [ ! -d "$PROJECT_DIR" ]; then
    echo "Директория проекта не найдена: $PROJECT_DIR"
    echo "Клонируйте проект или используйте install.sh для установки"
    exit 1
fi

cd $PROJECT_DIR

# Проверяем, используется ли Docker Compose
if [ -f "docker-compose.yml" ]; then
    echo "🔄 Обновляем проект из GitHub..."
    git pull origin main
    
    echo "🐳 Запускаем проект через Docker Compose..."
    docker-compose down
    docker-compose up -d
    
    echo "✅ Проект успешно запущен!"
    echo "📋 Статус: docker-compose ps"
    echo "📝 Логи: docker-compose logs -f"
else
    echo "systemd сервисы не поддерживаются этим скриптом"
    echo "Используйте: sudo systemctl restart keystone-bot.service keystone-backend.service"
fi

echo "🎉 Запуск завершен!"