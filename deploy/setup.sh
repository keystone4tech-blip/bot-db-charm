#!/bin/bash
set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}🚀 УСТАНОВКА ПРОЕКТА НА UBUNTU СЕРВЕР${NC}"
echo -e "${GREEN}===========================================${NC}"
echo ""

# 1. ОБНОВЛЯЕМ СИСТЕМУ
echo -e "${YELLOW}📦 Обновляем систему...${NC}"
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git nano htop net-tools

# 2. УСТАНАВЛИВАЕМ DOCKER
echo -e "${YELLOW}🐳 Устанавливаем Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker установлен${NC}"
else
    echo -e "${GREEN}✅ Docker уже установлен${NC}"
fi

# 3. УСТАНАВЛИВАЕМ DOCKER COMPOSE
echo -e "${YELLOW}📦 Устанавливаем Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose установлен${NC}"
else
    echo -e "${GREEN}✅ Docker Compose уже установлен${NC}"
fi

docker-compose --version

# 4. УСТАНАВЛИВАЕМ NODE.JS (для backend)
echo -e "${YELLOW}📦 Устанавливаем Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✅ Node.js установлен${NC}"
else
    echo -e "${GREEN}✅ Node.js уже установлен${NC}"
fi

node --version
npm --version

# 5. УСТАНАВЛИВАЕМ PYTHON (для бота)
echo -e "${YELLOW}📦 Устанавливаем Python 3.11...${NC}"
if ! command -v python3.11 &> /dev/null; then
    sudo apt install -y software-properties-common
    sudo add-apt-repository -y ppa:deadsnakes/ppa
    sudo apt update
    sudo apt install -y python3.11 python3-pip python3.11-venv
    echo -e "${GREEN}✅ Python установлен${NC}"
else
    echo -e "${GREEN}✅ Python уже установлен${NC}"
fi

python3.11 --version

# 6. УСТАНАВЛИВАЕМ NGINX (для домена и SSL)
echo -e "${YELLOW}🌐 Устанавливаем Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    echo -e "${GREEN}✅ Nginx установлен${NC}"
else
    echo -e "${GREEN}✅ Nginx уже установлен${NC}"
fi

# 7. УСТАНАВЛИВАЕМ CERTBOT (для SSL сертификата)
echo -e "${YELLOW}🔒 Устанавливаем Certbot для SSL...${NC}"
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot установлен${NC}"
else
    echo -e "${GREEN}✅ Certbot уже установлен${NC}"
fi

# 8. СОЗДАЕМ ДИРЕКТОРИЮ ПРОЕКТА
echo -e "${YELLOW}📁 Создаем директорию проекта...${NC}"
PROJECT_DIR="/home/$USER/keystone_project"

if [ ! -d "$PROJECT_DIR" ]; then
    mkdir -p $PROJECT_DIR
    echo -e "${GREEN}✅ Директория создана: $PROJECT_DIR${NC}"
else
    echo -e "${YELLOW}⚠️  Директория уже существует: $PROJECT_DIR${NC}"
fi

# 9. КЛОНИРУЕМ РЕПОЗИТОРИЙ
echo -e "${YELLOW}📥 Клонируем репозиторий с GitHub...${NC}"
if [ ! -d "$PROJECT_DIR/.git" ]; then
    read -p "Введите URL вашего GitHub репозитория (https://github.com/ваш-ник/ваш-репо): " REPO_URL
    git clone $REPO_URL $PROJECT_DIR
    echo -e "${GREEN}✅ Репозиторий клонирован${NC}"
else
    echo -e "${YELLOW}⚠️  Репозиторий уже клонирован. Обновляем...${NC}"
    cd $PROJECT_DIR
    git pull origin main || git pull origin master
    echo -e "${GREEN}✅ Репозиторий обновлен${NC}"
fi

cd $PROJECT_DIR

# 10. СОЗДАЕМ .env ФАЙЛ
echo -e "${YELLOW}⚙️  Создаем .env файл...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  .env файл создан из .env.example${NC}"

        # Автоматически заполняем .env файл вашими значениями
        sed -i "s/BOT_TOKEN=.*/BOT_TOKEN=8584356079:AAHucKiVnHSV7qu2ba_XEA0SqnBX1LAg_pA/" .env
        sed -i "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=8584356079:AAHucKiVnHSV7qu2ba_XEA0SqnBX1LAg_pA/" .env
        sed -i "s/ADMIN_ID=.*/ADMIN_ID=6521050178/" .env
        sed -i "s/ADMIN_IDS=.*/ADMIN_IDS=6521050178/" .env
        sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=2046/" .env
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=jJ4K9XzF2qR8nP7wE3vL6cA1mS5tY0hB3nI6pW7oE4rT9yU2aQ5xZ8sM1nH6cV3bG7k/" .env
        sed -i "s/VITE_TELEGRAM_BOT_USERNAME=.*/VITE_TELEGRAM_BOT_USERNAME=Keystone_Tech_Robot/" .env
        sed -i "s/DOMAIN=.*/DOMAIN=keystone-tech.ru/" .env
        sed -i "s/SSL_EMAIL=.*/SSL_EMAIL=m.v.s.4@mail.ru/" .env
        sed -i "s/BOT_USERNAME=.*/BOT_USERNAME=Keystone_Tech_Robot/" .env

        echo -e "${GREEN}✅ .env файл автоматически заполнен${NC}"
    else
        echo -e "${RED}❌ .env.example не найден. Создайте .env файл вручную${NC}"
    fi
else
    echo -e "${GREEN}✅ .env файл уже существует${NC}"

    # Проверяем, нужно ли обновить значения
    if grep -q "changeme\|your-secret-key-change-this" .env; then
        echo -e "${YELLOW}🔄 Обновляем .env файл с вашими значениями...${NC}"

        sed -i "s/BOT_TOKEN=.*/BOT_TOKEN=8584356079:AAHucKiVnHSV7qu2ba_XEA0SqnBX1LAg_pA/" .env
        sed -i "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=8584356079:AAHucKiVnHSV7qu2ba_XEA0SqnBX1LAg_pA/" .env
        sed -i "s/ADMIN_ID=.*/ADMIN_ID=6521050178/" .env
        sed -i "s/ADMIN_IDS=.*/ADMIN_IDS=6521050178/" .env
        sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=2046/" .env
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=jJ4K9XzF2qR8nP7wE3vL6cA1mS5tY0hB3nI6pW7oE4rT9yU2aQ5xZ8sM1nH6cV3bG7k/" .env
        sed -i "s/VITE_TELEGRAM_BOT_USERNAME=.*/VITE_TELEGRAM_BOT_USERNAME=Keystone_Tech_Robot/" .env
        sed -i "s/DOMAIN=.*/DOMAIN=keystone-tech.ru/" .env
        sed -i "s/SSL_EMAIL=.*/SSL_EMAIL=m.v.s.4@mail.ru/" .env
        sed -i "s/BOT_USERNAME=.*/BOT_USERNAME=Keystone_Tech_Robot/" .env

        echo -e "${GREEN}✅ .env файл обновлен${NC}"
    fi
fi

# 11. НАСТРОЙКА ДОМЕНА И SSL
echo -e "${YELLOW}🔒 Настраиваем SSL сертификат...${NC}"
read -p "Хотите настроить домен и SSL сертификат сейчас? (y/n): " SETUP_SSL

if [ "$SETUP_SSL" = "y" ] || [ "$SETUP_SSL" = "Y" ]; then
    read -p "Введите ваш домен (example.com): " DOMAIN
    read -p "Введите ваш email для Let's Encrypt: " EMAIL

    # Создаем временный Nginx конфиг для сертификата
    sudo bash -c "cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF"

    # Заменяем $DOMAIN в конфиге
    sudo sed -i "s/\$DOMAIN/$DOMAIN/g" /etc/nginx/sites-available/$DOMAIN

    sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl reload nginx

    # Создаем директорию для certbot
    sudo mkdir -p /var/www/certbot

    # Получаем сертификат
    sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN -m $EMAIL --agree-tos --no-eff-email -n || {
        echo -e "${RED}❌ Ошибка при получении SSL сертификата${NC}"
        echo -e "${YELLOW}Проверьте, что домен правильно указывает на IP сервера${NC}"
        exit 1
    }

    echo -e "${GREEN}✅ SSL сертификат установлен${NC}"

    # 12. СОЗДАЕМ ФИНАЛЬНЫЙ NGINX КОНФИГ
    echo -e "${YELLOW}⚙️  Создаем Nginx конфигурацию...${NC}"
    sudo bash -c "cat > /etc/nginx/sites-available/$DOMAIN << 'EOFNGINX'
# Перенаправляем HTTP на HTTPS
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS конфигурация
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;

    # SSL параметры
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Проксируем запросы на frontend (порт 3001 для статических файлов)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Заголовки безопасности (осторожно с Telegram WebApp)
        add_header X-Frame-Options \"SAMEORIGIN\" always;
        add_header X-Content-Type-Options \"nosniff\" always;
        add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;

        # Для предотвращения циклических редиректов в Telegram WebApp
        proxy_redirect off;
    }

    # API backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Original-Host \$host;
        proxy_redirect off;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_redirect off;
    }

    # Для Telegram WebApp (важно для избежания циклических редиректов)
    location ~ ^/(telegram|webapp|launch)/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_redirect off;
    }
}
EOFNGINX"

    # Заменяем плейсхолдер на реальный домен
    sudo sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/$DOMAIN

    sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
    sudo nginx -t
    sudo systemctl reload nginx

    echo -e "${GREEN}✅ Nginx конфигурация создана${NC}"

    # 13. НАСТРАИВАЕМ АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ СЕРТИФИКАТА
    echo -e "${YELLOW}🔄 Настраиваем автоматическое обновление SSL сертификата...${NC}"
    sudo bash -c "cat > /etc/cron.d/certbot-renewal << 'EOF'
0 3 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'
EOF"

    echo -e "${GREEN}✅ Автоматическое обновление SSL сертификата настроено${NC}"
else
    echo -e "${YELLOW}⚠️  Пропускаем настройку SSL. Вы можете сделать это позже${NC}"
fi

# 14. ЗАПУСКАЕМ DOCKER КОНТЕЙНЕРЫ
echo -e "${YELLOW}🐳 Запускаем Docker контейнеры...${NC}"
cd $PROJECT_DIR

# Останавливаем старые контейнеры если есть
docker-compose down 2>/dev/null || true

# Запускаем новые
docker-compose up -d --build

# Ждем, пока контейнеры стартуют
echo -e "${YELLOW}⏳ Ожидание запуска контейнеров (30 сек)...${NC}"
sleep 30

# 15. ПРОВЕРЯЕМ СТАТУС
echo -e "${YELLOW}📊 Статус контейнеров:${NC}"
docker-compose ps

# 16. ФИНАЛЬНОЕ СООБЩЕНИЕ
echo ""
echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}✅ УСТАНОВКА ЗАВЕРШЕНА УСПЕШНО!${NC}"
echo -e "${GREEN}===========================================${NC}"
echo ""
echo -e "${YELLOW}📝 ИНФОРМАЦИЯ О ВАШЕМ ПРОЕКТЕ:${NC}"
echo "   Директория: $PROJECT_DIR"
if [ -n "$DOMAIN" ]; then
    echo "   Домен: https://$DOMAIN"
fi
echo "   Backend: http://localhost:3000"
echo "   Docker: docker-compose ps (проверить статус)"
echo ""
echo -e "${YELLOW}📋 ПОЛЕЗНЫЕ КОМАНДЫ:${NC}"
echo "   Посмотреть логи:          docker-compose logs -f"
echo "   Логи бота:                docker-compose logs -f bot"
echo "   Логи backend:             docker-compose logs -f backend"
echo "   Логи базы:                docker-compose logs -f postgres"
echo "   Перезапустить контейнеры: docker-compose restart"
echo "   Остановить все:           docker-compose down"
echo ""
if [ -n "$DOMAIN" ]; then
    echo -e "${YELLOW}🔐 SSL СЕРТИФИКАТ:${NC}"
    echo "   Путь: /etc/letsencrypt/live/$DOMAIN/"
    echo "   Обновление: Автоматическое (каждый день в 3:00)"
    echo ""
    echo -e "${YELLOW}🌐 NGINX:${NC}"
    echo "   Конфиг: /etc/nginx/sites-available/$DOMAIN"
    echo "   Перезагрузка: sudo systemctl reload nginx"
    echo ""
fi
echo -e "${YELLOW}📥 СЛЕДУЮЩИЕ ШАГИ:${NC}"
if [ -n "$DOMAIN" ]; then
    echo "   1. Проверьте, что домен работает: https://$DOMAIN"
fi
echo "   2. Настройте GitHub Actions для автоматического деплоя"
echo "   3. Посмотрите логи: docker-compose logs -f"
echo ""
