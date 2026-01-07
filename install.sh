#!/bin/bash

# Универсальный установочный скрипт для проекта Keystone Bot
# Запуск: bash install.sh

set -e  # Выход при ошибке

echo "==========================================="
echo "Установка проекта Keystone Bot"
echo "==========================================="

# Проверяем, запущено ли от root
if [[ $EUID -eq 0 ]]; then
   echo "НЕ РЕКОМЕНДУЕТСЯ запускать этот скрипт от root. Используйте обычного пользователя."
   read -p "Продолжить anyway? (y/N): " -n 1 -r
   echo
   if [[ ! $REPLY =~ ^[Yy]$ ]]; then
       exit 1
   fi
fi

# Параметры по умолчанию
PROJECT_DIR="/home/deploy/keystone-bot"
DOMAIN="keystone-tech.ru"
USE_DOCKER=true  # по умолчанию используем Docker
INSTALL_DEPS=true

# Функция для проверки и установки зависимостей
install_dependencies() {
    echo "Проверяем и устанавливаем зависимости..."
    
    # Определяем OS
    if [ -f /etc/debian_version ]; then
        OS="debian"
        PKGMGR="apt"
    elif [ -f /etc/redhat-release ]; then
        OS="rhel"
        PKGMGR="yum"
    elif [ -f /etc/alpine-release ]; then
        OS="alpine"
        PKGMGR="apk"
    else
        echo "Неподдерживаемая операционная система"
        exit 1
    fi
    
    # Устанавливаем зависимости в зависимости от OS
    if [ "$OS" = "debian" ]; then
        sudo apt update
        sudo apt install -y git curl wget python3 python3-pip nodejs npm docker.io docker-compose nginx certbot python3-certbot-nginx
    elif [ "$OS" = "rhel" ]; then
        sudo yum update -y
        sudo yum install -y git curl wget python3 python3-pip nodejs npm docker docker-compose nginx certbot python3-certbot-nginx
    elif [ "$OS" = "alpine" ]; then
        sudo apk add --no-cache git curl wget python3 py3-pip nodejs npm docker docker-compose-openrc nginx certbot
    fi
    
    # Включаем Docker
    sudo systemctl enable docker
    sudo systemctl start docker
    
    # Добавляем текущего пользователя в группу docker
    sudo usermod -aG docker $USER
}

# Функция для создания пользователя deploy
setup_deploy_user() {
    echo "Настраиваем пользователя deploy..."
    
    # Проверяем, существует ли пользователь
    if ! id "deploy" &>/dev/null; then
        sudo useradd -m -s /bin/bash deploy
        echo "Пользователь deploy создан"
    fi
    
    # Добавляем текущего пользователя в sudo для установки
    if ! groups $USER | grep -q "\bsudo\b"; then
        echo "Добавьте текущего пользователя в sudo для продолжения установки"
        exit 1
    fi
}

# Функция для клонирования репозитория
clone_repository() {
    echo "Клонируем репозиторий..."
    
    if [ -d "$PROJECT_DIR" ]; then
        echo "Директория $PROJECT_DIR уже существует. Обновляем..."
        cd $PROJECT_DIR
        git pull origin main
    else
        sudo mkdir -p $(dirname $PROJECT_DIR)
        sudo git clone https://github.com/keystone4tech-blip/bot-db-charm.git $PROJECT_DIR
        sudo chown -R deploy:deploy $PROJECT_DIR
    fi
}

# Функция для настройки .env файла
setup_env_file() {
    echo "Настраиваем .env файл..."
    
    ENV_FILE="$PROJECT_DIR/.env"
    
    if [ ! -f "$ENV_FILE" ]; then
        echo "Создаем шаблон .env файла..."
        sudo -u deploy cp $PROJECT_DIR/.env $ENV_FILE 2>/dev/null || {
            # Если .env не существует в репозитории, создаем шаблон
            sudo -u deploy tee $ENV_FILE > /dev/null << EOF
# Токен Telegram-бота (получить у @BotFather)
BOT_TOKEN=

# ID администраторов бота (через запятую)
ADMIN_IDS=

# Настройки базы данных PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=keystone

# Использовать API клиент для взаимодействия с Node.js сервером (решает проблему дублирования БД)
USE_API_CLIENT=true
API_BASE_URL=http://localhost:3000

# WebApp URL
WEBAPP_URL=https://${DOMAIN}

# Supabase настройки (для веб-приложения)
VITE_SUPABASE_PROJECT_ID=""
VITE_SUPABASE_PUBLISHABLE_KEY=""
VITE_SUPABASE_URL=""
VITE_TELEGRAM_BOT_USERNAME=""

# Резервные переменные для совместимости
TELEGRAM_BOT_TOKEN=""
SUPABASE_DATABASE_URL="postgresql://postgres:your_secure_password_here@localhost:5432/keystone"
POSTGRES_DATABASE_URL="postgresql://postgres:your_secure_password_here@localhost:5432/keystone"
EOF
        }
        echo "ПРЕДУПРЕЖДЕНИЕ: Необходимо заполнить .env файл вручную!"
        echo "Файл: $ENV_FILE"
    fi
}

# Функция для установки зависимостей проекта
install_project_deps() {
    echo "Устанавливаем зависимости проекта..."
    
    # Устанавливаем Python зависимости
    cd $PROJECT_DIR/telegram_bot
    sudo -u deploy pip3 install -r requirements.txt
    
    # Устанавливаем Node.js зависимости
    cd $PROJECT_DIR
    sudo -u deploy npm install
}

# Функция для запуска через Docker Compose
start_with_docker() {
    echo "Запускаем проект через Docker Compose..."
    
    cd $PROJECT_DIR
    
    # Проверяем, есть ли docker-compose.yml
    if [ ! -f "docker-compose.yml" ]; then
        echo "Файл docker-compose.yml не найден, создаем его..."
        sudo -u deploy tee docker-compose.yml > /dev/null << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: keystone_postgres
    environment:
      POSTGRES_DB: keystone
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD:-your_secure_password_here}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: keystone_backend
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=${DB_PASSWORD:-your_secure_password_here}
      - DB_NAME=keystone
      - TELEGRAM_BOT_TOKEN=${BOT_TOKEN}
    depends_on:
      - postgres
    restart: unless-stopped
    env_file:
      - .env

  bot:
    build:
      context: .
      dockerfile: Dockerfile.bot
    container_name: keystone_bot
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=${DB_PASSWORD:-your_secure_password_here}
      - DB_NAME=keystone
      - BOT_TOKEN=${BOT_TOKEN}
      - USE_API_CLIENT=true
      - API_BASE_URL=http://backend:3000
    depends_on:
      - postgres
      - backend
    restart: unless-stopped
    env_file:
      - .env

volumes:
  postgres_data:
EOF
    fi
    
    # Запускаем все сервисы
    sudo -u deploy docker-compose up -d
    
    echo "Docker сервисы запущены!"
    echo "Проверить статус: cd $PROJECT_DIR && docker-compose ps"
    echo "Проверить логи: cd $PROJECT_DIR && docker-compose logs -f"
}

# Функция для запуска через systemd (альтернатива Docker)
start_with_systemd() {
    echo "Настройка и запуск через systemd..."
    
    # Копируем сервисы
    sudo cp $PROJECT_DIR/deploy/services/*.service /etc/systemd/system/
    sudo systemctl daemon-reload
    
    # Включаем и запускаем сервисы
    sudo systemctl enable keystone-bot.service
    sudo systemctl enable keystone-backend.service
    sudo systemctl start keystone-bot.service
    sudo systemctl start keystone-backend.service
    
    echo "Systemd сервисы запущены!"
    echo "Проверить статус: sudo systemctl status keystone-bot.service keystone-backend.service"
}

# Функция для настройки Nginx и SSL
setup_nginx_ssl() {
    echo "Настраиваем Nginx и SSL..."
    
    # Создаем конфигурацию Nginx
    sudo tee /etc/nginx/sites-available/keystone-bot > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    # Включаем сайт
    sudo ln -sf /etc/nginx/sites-available/keystone-bot /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    
    # Устанавливаем SSL сертификат (если домен доступен)
    read -p "Установить SSL сертификат для $DOMAIN? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    fi
}

# Основной процесс установки
main() {
    echo "Начинаем установку Keystone Bot..."
    
    if [ "$INSTALL_DEPS" = true ]; then
        install_dependencies
    fi
    
    setup_deploy_user
    clone_repository
    setup_env_file
    install_project_deps
    
    if [ "$USE_DOCKER" = true ]; then
        start_with_docker
    else
        start_with_systemd
    fi
    
    # Запрашиваем у пользователя домен
    read -p "Введите ваш домен (по умолчанию $DOMAIN): " -e USER_DOMAIN
    if [ ! -z "$USER_DOMAIN" ]; then
        DOMAIN=$USER_DOMAIN
    fi
    
    setup_nginx_ssl
    
    echo "==========================================="
    echo "УСТАНОВКА ЗАВЕРШЕНА!"
    echo "==========================================="
    echo ""
    echo "Ваши сервисы запущены!"
    echo ""
    echo "Если использовался Docker:"
    echo "  - Проверить статус: cd $PROJECT_DIR && docker-compose ps"
    echo "  - Проверить логи: cd $PROJECT_DIR && docker-compose logs -f"
    echo ""
    echo "Если использовался systemd:"
    echo "  - Проверить статус: sudo systemctl status keystone-bot.service keystone-backend.service"
    echo ""
    echo "Веб-интерфейс доступен по адресу: https://$DOMAIN"
    echo ""
    echo "Для ручного обновления: cd $PROJECT_DIR && bash deploy/scripts/update.sh"
    echo ""
    echo "ПРЕДУПРЕЖДЕНИЕ: Не забудьте заполнить .env файл с реальными данными!"
    echo "Файл: $PROJECT_DIR/.env"
    echo ""
    echo "==========================================="
}

# Запуск основной функции
main "$@"