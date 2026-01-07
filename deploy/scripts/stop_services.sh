#!/bin/bash

# Скрипт остановки всех сервисов
echo "Останавливаем все сервисы..."

PROJECT_PATH="/home/deploy/keystone-bot"

# Проверяем, используется ли Docker Compose
if [ -f "$PROJECT_PATH/docker-compose.yml" ]; then
    echo "Останавливаем Docker Compose сервисы..."
    cd $PROJECT_PATH
    docker-compose down
else
    # Останавливаем systemd сервисы
    echo "Останавливаем systemd сервисы..."
    sudo systemctl stop keystone-bot.service
    sudo systemctl stop keystone-backend.service
fi

echo "Сервисы остановлены!"