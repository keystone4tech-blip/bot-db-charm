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
    echo "Копируем .env.example в .env"
    cp $PROJECT_PATH/.env.example $ENV_FILE

    # Заполняем .env файл вашими значениями
    sed -i "s/BOT_TOKEN=.*/BOT_TOKEN=8584356079:AAHucKiVnHSV7qu2ba_XEA0SqnBX1LAg_pA/" $ENV_FILE
    sed -i "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=8584356079:AAHucKiVnHSV7qu2ba_XEA0SqnBX1LAg_pA/" $ENV_FILE
    sed -i "s/ADMIN_ID=.*/ADMIN_ID=6521050178/" $ENV_FILE
    sed -i "s/ADMIN_IDS=.*/ADMIN_IDS=6521050178/" $ENV_FILE
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=2046/" $ENV_FILE
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=jJ4K9XzF2qR8nP7wE3vL6cA1mS5tY0hB3nI6pW7oE4rT9yU2aQ5xZ8sM1nH6cV3bG7k/" $ENV_FILE
    sed -i "s/VITE_TELEGRAM_BOT_USERNAME=.*/VITE_TELEGRAM_BOT_USERNAME=Keystone_Tech_Robot/" $ENV_FILE
    sed -i "s/DOMAIN=.*/DOMAIN=keystone-tech.ru/" $ENV_FILE
    sed -i "s/SSL_EMAIL=.*/SSL_EMAIL=m.v.s.4@mail.ru/" $ENV_FILE
    sed -i "s/BOT_USERNAME=.*/BOT_USERNAME=Keystone_Tech_Robot/" $ENV_FILE

    echo "✅ .env файл автоматически заполнен"
fi

echo "Запускаем сервисы"
sudo systemctl enable keystone-bot.service
sudo systemctl enable keystone-backend.service
sudo systemctl start keystone-bot.service
sudo systemctl start keystone-backend.service

echo "Деплой завершен успешно!"
echo "Проверить статус сервисов: systemctl status keystone-bot.service keystone-backend.service"