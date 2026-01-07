# PowerShell скрипт для установки Keystone Bot
# Запуск: powershell -ExecutionPolicy Bypass -File install.ps1

Write-Host "===========================================" -ForegroundColor Green
Write-Host "Установка проекта Keystone Bot" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Проверяем права администратора
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Требуются права администратора для выполнения установки." -ForegroundColor Red
    exit 1
}

# Проверяем зависимости
$dependencies = @("git", "docker", "docker-compose")
foreach ($dep in $dependencies) {
    if (!(Get-Command $dep -ErrorAction SilentlyContinue)) {
        Write-Host "$dep не найден. Установите $dep перед продолжением." -ForegroundColor Red
        exit 1
    }
}

# Путь к проекту
$projectDir = "C:\Deploy\keystone-bot"
$envFile = "$projectDir\.env"

# Создаем директорию
if (!(Test-Path $projectDir)) {
    New-Item -ItemType Directory -Path $projectDir -Force
}

# Клонируем репозиторий
Write-Host "Клонируем репозиторий..." -ForegroundColor Yellow
Set-Location $projectDir
git clone https://github.com/keystone4tech-blip/bot-db-charm.git $projectDir

# Проверяем, существует ли .env файл
if (!(Test-Path $envFile)) {
    Write-Host "Создаем шаблон .env файла..." -ForegroundColor Yellow
    @"
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
WEBAPP_URL=https://keystone-tech.ru

# Supabase настройки (для веб-приложения)
VITE_SUPABASE_PROJECT_ID=""
VITE_SUPABASE_PUBLISHABLE_KEY=""
VITE_SUPABASE_URL=""
VITE_TELEGRAM_BOT_USERNAME=""

# Резервные переменные для совместимости
TELEGRAM_BOT_TOKEN=""
SUPABASE_DATABASE_URL="postgresql://postgres:your_secure_password_here@localhost:5432/keystone"
POSTGRES_DATABASE_URL="postgresql://postgres:your_secure_password_here@localhost:5432/keystone"
"@ | Out-File -FilePath $envFile -Encoding UTF8

    Write-Host "ПРЕДУПРЕЖДЕНИЕ: Необходимо заполнить .env файл вручную!" -ForegroundColor Red
    Write-Host "Файл: $envFile" -ForegroundColor Red
}

# Устанавливаем Python зависимости
Write-Host "Устанавливаем Python зависимости..." -ForegroundColor Yellow
Set-Location "$projectDir\telegram_bot"
pip install -r requirements.txt

# Устанавливаем Node.js зависимости
Set-Location $projectDir
npm install

# Запускаем проект через Docker
Write-Host "Запускаем проект через Docker Compose..." -ForegroundColor Yellow
Set-Location $projectDir
docker-compose up -d

Write-Host "===========================================" -ForegroundColor Green
Write-Host "УСТАНОВКА ЗАВЕРШЕНА!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ваши сервисы запущены!" -ForegroundColor Green
Write-Host ""
Write-Host "Проверить статус: docker-compose ps" -ForegroundColor White
Write-Host "Проверить логи: docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "ПРЕДУПРЕЖДЕНИЕ: Не забудьте заполнить .env файл с реальными данными!" -ForegroundColor Red
Write-Host "Файл: $envFile" -ForegroundColor Red