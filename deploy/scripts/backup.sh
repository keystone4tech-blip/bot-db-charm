#!/bin/bash

# Скрипт резервного копирования проекта
set -e

echo "Начинаем создание резервной копии..."

# Параметры
PROJECT_PATH="/home/deploy/keystone-bot"
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="keystone-bot-backup-$DATE"

# Создаем директорию для бэкапов
mkdir -p $BACKUP_DIR

# Создаем архив проекта
echo "Создаем архив проекта..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$(dirname $PROJECT_PATH)" "$(basename $PROJECT_PATH)"

# Если используется PostgreSQL, создаем дамп БД
if command -v pg_dump &> /dev/null; then
    echo "Создаем дамп базы данных..."
    DB_NAME=$(grep DB_NAME /home/deploy/keystone-bot/.env | cut -d '=' -f2)
    DB_USER=$(grep DB_USER /home/deploy/keystone-bot/.env | cut -d '=' -f2)
    DB_HOST=$(grep DB_HOST /home/deploy/keystone-bot/.env | cut -d '=' -f2)
    DB_PORT=$(grep DB_PORT /home/deploy/keystone-bot/.env | cut -d '=' -f2)
    
    if [ ! -z "$DB_NAME" ] && [ ! -z "$DB_USER" ]; then
        pg_dump -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/db-$BACKUP_NAME.sql"
    fi
fi

# Удаляем бэкапы старше 7 дней
echo "Удаляем старые бэкапы..."
find $BACKUP_DIR -name "keystone-bot-backup-*" -type f -mtime +7 -delete

echo "Резервная копия создана: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo "Количество сохраненных бэкапов: $(ls $BACKUP_DIR/keystone-bot-backup-*.tar.gz | wc -l)"