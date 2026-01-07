#!/bin/bash

# Скрипт восстановления из резервной копии
set -e

if [ $# -ne 1 ]; then
    echo "Использование: $0 <путь_к_бэкапу.tar.gz>"
    exit 1
fi

BACKUP_FILE=$1
PROJECT_PATH="/home/deploy/keystone-bot"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Файл бэкапа не найден: $BACKUP_FILE"
    exit 1
fi

echo "Останавливаем сервисы..."
sudo systemctl stop keystone-bot.service || true
sudo systemctl stop keystone-backend.service || true

# Если используется Docker Compose
if [ -f "$PROJECT_PATH/docker-compose.yml" ]; then
    cd $PROJECT_PATH
    docker-compose down
fi

echo "Восстанавливаем проект из бэкапа..."
sudo rm -rf $PROJECT_PATH
sudo mkdir -p $PROJECT_PATH
sudo tar -xzf "$BACKUP_FILE" -C /home/deploy/

echo "Устанавливаем права доступа..."
sudo chown -R deploy:deploy $PROJECT_PATH

# Если есть дамп БД, восстанавливаем его
DB_DUMP=$(echo $BACKUP_FILE | sed 's/keystone-bot-backup/db-&/' | sed 's/tar.gz/sql/')
if [ -f "$DB_DUMP" ]; then
    echo "Восстанавливаем базу данных..."
    DB_NAME=$(grep DB_NAME $PROJECT_PATH/.env | cut -d '=' -f2)
    DB_USER=$(grep DB_USER $PROJECT_PATH/.env | cut -d '=' -f2)
    
    if [ ! -z "$DB_NAME" ] && [ ! -z "$DB_USER" ]; then
        # Создаем базу данных если не существует
        sudo -u postgres psql -c "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
        sudo -u postgres psql -d $DB_NAME -f "$DB_DUMP"
    fi
fi

echo "Перезапускаем сервисы..."
if [ -f "$PROJECT_PATH/docker-compose.yml" ]; then
    cd $PROJECT_PATH
    docker-compose up -d
else
    sudo systemctl start keystone-backend.service
    sudo systemctl start keystone-bot.service
fi

echo "Восстановление завершено!"