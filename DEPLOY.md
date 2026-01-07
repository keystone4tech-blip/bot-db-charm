# Деплой проекта Keystone Bot

## Подготовка сервера

### 1. Установка необходимых компонентов

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y git nodejs npm python3 python3-pip docker.io docker-compose nginx certbot python3-certbot-nginx
```

### 2. Настройка пользователя deploy

```bash
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy
```

### 3. Настройка SSH доступа

```bash
# На сервере
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

## Метод 1: Использование systemd сервисов (рекомендуется)

### 1. Клонирование репозитория

```bash
sudo -u deploy bash -c "cd /home/deploy && git clone https://github.com/keystone4tech-blip/bot-db-charm.git keystone-bot"
```

### 2. Установка зависимостей

```bash
cd /home/deploy/keystone-bot

# Установка Python зависимостей
cd telegram_bot
pip3 install -r requirements.txt

# Установка Node.js зависимостей
cd ..
npm install
```

### 3. Настройка .env файла

```bash
cp .env /home/deploy/keystone-bot/.env
# Отредактируйте .env файл с вашими настройками
```

### 4. Копирование и запуск сервисов

```bash
sudo cp /home/deploy/keystone-bot/deploy/services/*.service /etc/systemd/system/
sudo systemctl daemon-reload

sudo systemctl enable keystone-bot.service
sudo systemctl enable keystone-backend.service

sudo systemctl start keystone-bot.service
sudo systemctl start keystone-backend.service
```

## Метод 2: Использование Docker Compose

### 1. Запуск всех сервисов

```bash
cd /home/deploy/keystone-bot
docker-compose up -d
```

## Настройка GitHub Actions

### 1. Добавление секретов в GitHub

В настройках репозитория добавьте следующие секреты:

- `HOST` - IP-адрес или домен сервера
- `USERNAME` - имя пользователя (обычно deploy)
- `SSH_KEY` - приватный SSH ключ для доступа к серверу
- `PORT` - SSH порт (по умолчанию 22)

### 2. Автоматический деплой

После настройки секретов, каждый push в ветку main будет автоматически деплоиться на сервер.

## Управление сервисами

### Проверка статуса

```bash
# systemd
sudo systemctl status keystone-bot.service
sudo systemctl status keystone-backend.service

# Docker Compose
docker-compose ps
```

### Просмотр логов

```bash
# systemd
sudo journalctl -u keystone-bot.service -f
sudo journalctl -u keystone-backend.service -f

# Docker Compose
docker-compose logs -f
```

### Ручное обновление

```bash
# systemd
cd /home/deploy/keystone-bot
git pull origin main
sudo systemctl restart keystone-bot.service keystone-backend.service

# Docker Compose
cd /home/deploy/keystone-bot
git pull origin main
docker-compose down
docker-compose up -d
```

## Настройка домена и SSL

### 1. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/keystone-bot
```

Пример конфигурации:

```nginx
server {
    listen 80;
    server_name keystone-tech.ru www.keystone-tech.ru;

    location / {
        proxy_pass http://localhost:5173;  # для разработки
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Включение SSL

```bash
sudo certbot --nginx -d keystone-tech.ru -d www.keystone-tech.ru
```

## Резервное копирование

Скрипты для резервного копирования находятся в `deploy/scripts/`.

```bash
# Создание резервной копии
./deploy/scripts/backup.sh
```

## Архитектура проекта

Проект использует следующую архитектуру:
- Единая локальная PostgreSQL база данных для всех компонентов
- Python бот взаимодействует с Node.js сервером через API
- Node.js сервер обеспечивает взаимодействие с PostgreSQL и предоставляет API для фронтенда
- React фронтенд получает данные через API Node.js сервера