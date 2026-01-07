# Keystone Tech Telegram Bot & Web Application

## Установка и запуск

### Быстрая установка (рекомендуется)

Для быстрой установки проекта выполните:

```bash
curl -sSL https://raw.githubusercontent.com/ваш-аккаунт/ваш-репозиторий/main/install.sh | bash
```

### Ручная установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/keystone4tech-blip/bot-db-charm.git
cd bot-db-charm
```

2. Установите зависимости:
```bash
# Установка Python зависимостей
cd telegram_bot
pip install -r requirements.txt

# Установка Node.js зависимостей
cd ..
npm install
```

3. Настройте переменные окружения:
```bash
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

4. Запустите проект:
```bash
# Вариант 1: через Docker Compose (рекомендуется)
docker-compose up -d

# Вариант 2: через systemd сервисы
sudo cp deploy/services/*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable keystone-bot.service keystone-backend.service
sudo systemctl start keystone-bot.service keystone-backend.service
```

## Структура проекта

- `telegram_bot/` - Python бот с Aiogram
- `server.js` - Node.js сервер для API (взаимодействие с локальной PostgreSQL)
- `src/` - React фронтенд
- `deploy/` - скрипты для деплоя
- `Dockerfile.*` - Docker конфигурации
- `docker-compose.yml` - конфигурация для запуска всех сервисов

## Архитектура

- Используется единая локальная PostgreSQL база данных для всех компонентов
- Python бот взаимодействует с Node.js сервером через API
- Node.js сервер обеспечивает взаимодействие с PostgreSQL
- React фронтенд использует API Node.js сервера для получения данных

## Управление

### Docker Compose
```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Перезапуск
docker-compose restart
```

### Systemd сервисы
```bash
# Статус
sudo systemctl status keystone-bot.service keystone-backend.service

# Запуск
sudo systemctl start keystone-bot.service keystone-backend.service

# Остановка
sudo systemctl stop keystone-bot.service keystone-backend.service

# Перезапуск
sudo systemctl restart keystone-bot.service keystone-backend.service
```

## Обновление

Для обновления до последней версии:
```bash
# Если используется Docker
cd /home/deploy/keystone-bot
git pull origin main
docker-compose down
docker-compose up -d

# Если используются systemd сервисы
cd /home/deploy/keystone-bot
git pull origin main
sudo systemctl restart keystone-bot.service keystone-backend.service
```

## Безопасность

- Все чувствительные данные должны быть в `.env` файле
- Используется API клиент для связи между ботом и сервером
- Пароли базы данных не хранятся в коде
- Валидация данных Telegram WebApp

## Поддержка

Для подробной информации по деплою см. [DEPLOY.md](DEPLOY.md)
Для быстрой установки см. [QUICK_INSTALL.md](QUICK_INSTALL.md)