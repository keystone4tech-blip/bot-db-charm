#!/bin/bash

# Скрипт для настройки структуры деплоя проекта
echo "Настройка структуры деплоя Keystone Bot..."

# Создаем директории
mkdir -p deploy/scripts
mkdir -p deploy/services
mkdir -p deploy/backups

echo "Структура создана:"
echo "- deploy/scripts/ - скрипты для деплоя и обновлений"
echo "- deploy/services/ - systemd сервисы"
echo "- deploy/backups/ - резервные копии"