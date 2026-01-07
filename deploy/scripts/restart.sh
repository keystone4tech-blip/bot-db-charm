#!/bin/bash

# Скрипт перезапуска сервисов
echo "Перезапускаем сервисы Keystone Bot..."

sudo systemctl restart keystone-bot.service
sudo systemctl restart keystone-backend.service

echo "Проверяем статус сервисов..."
sudo systemctl status keystone-bot.service --no-pager
sudo systemctl status keystone-backend.service --no-pager

echo "Перезапуск завершен!"