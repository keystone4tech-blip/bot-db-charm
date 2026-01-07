#!/bin/bash

# Скрипт для ежедневного резервного копирования (для cron)
LOG_FILE="/var/log/keystone-backup.log"

{
    echo "$(date): Начало ежедневного резервного копирования"
    /home/deploy/keystone-bot/deploy/scripts/backup.sh
    echo "$(date): Резервное копирование завершено"
} >> $LOG_FILE 2>&1