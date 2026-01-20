#!/bin/bash

# Скрипт запуска всех сервисов через Docker Compose
set -e

echo "Запускаем все сервисы через Docker Compose..."

# Проверяем, установлен ли Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    echo "Docker не установлен. Установите Docker перед продолжением."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose не установлен. Установите Docker Compose перед продолжением."
    exit 1
fi

# Путь к проекту
PROJECT_PATH="/home/deploy/keystone-bot"

echo "Переходим в директорию проекта"
cd $PROJECT_PATH

echo "Запускаем все сервисы в фоновом режиме"
docker-compose up -d

echo "Проверяем статус контейнеров"
docker-compose ps

echo "Сервисы запущены успешно!"
echo "Проверить логи: docker-compose logs -f"
echo "Остановить сервисы: docker-compose down"