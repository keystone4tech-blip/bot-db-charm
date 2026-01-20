#!/bin/bash

# Скрипт автоматического обновления проекта из GitHub
set -e

echo "Начинаем обновление проекта..."

# Путь к проекту
PROJECT_PATH="/home/deploy/keystone-bot"
BACKUP_PATH="/home/deploy/keystone-bot/backups/$(date +%Y%m%d_%H%M%S)"

echo "Создаем резервную копию в $BACKUP_PATH"
mkdir -p $BACKUP_PATH
cp -r $PROJECT_PATH $BACKUP_PATH

echo "Переходим в директорию проекта"
cd $PROJECT_PATH

echo "Получаем последние изменения из GitHub"
git fetch origin
git reset --hard origin/main

echo "Обновляем зависимости для Python бота"
cd telegram_bot
pip install -r requirements.txt

echo "Обновляем зависимости для Node.js сервера"
cd ../
npm install

echo "Собираем фронтенд"
cd src
npm run build

echo "Перезапускаем сервисы"
sudo systemctl restart keystone-bot.service
sudo systemctl restart keystone-backend.service

echo "Обновление завершено успешно!"