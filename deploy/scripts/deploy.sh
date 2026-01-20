#!/bin/bash

# Скрипт полного деплоя проекта
set -e

echo "Начинаем полный деплой проекта..."

# Параметры
PROJECT_NAME="keystone-bot"
PROJECT_PATH="/home/deploy/$PROJECT_NAME"
REPO_URL="https://github.com/keystone4tech-blip/bot-db-charm.git"

echo "Создаем пользователя deploy если не существует"
sudo useradd -m -s /bin/bash deploy || true

echo "Создаем директорию проекта"
sudo mkdir -p $PROJECT_PATH
sudo chown deploy:deploy $PROJECT_PATH

echo "Клонируем репозиторий"
sudo -u deploy bash -c "cd /home/deploy && git clone $REPO_URL $PROJECT_PATH"

echo "Устанавливаем зависимости для Python"
cd $PROJECT_PATH
sudo -u deploy bash -c "cd $PROJECT_PATH/telegram_bot && pip install -r requirements.txt"

echo "Устанавливаем зависимости для Node.js"
sudo -u deploy bash -c "cd $PROJECT_PATH && npm install"

echo "Копируем systemd сервисы"
sudo cp $PROJECT_PATH/deploy/services/*.service /etc/systemd/system/
sudo systemctl daemon-reload

echo "Создаем .env файл если не существует"
ENV_FILE="$PROJECT_PATH/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "Создайте .env файл с необходимыми переменными окружения"
    echo "Пример: cp $PROJECT_PATH/.env.example $ENV_FILE"
fi

echo "Запускаем сервисы"
sudo systemctl enable keystone-bot.service
sudo systemctl enable keystone-backend.service
sudo systemctl start keystone-bot.service
sudo systemctl start keystone-backend.service

echo "Деплой завершен успешно!"
echo "Проверить статус сервисов: systemctl status keystone-bot.service keystone-backend.service"