# 👋 НАЧНИТЕ ЗДЕСЬ

## 🚀 Что это за проект?

**Bot DB Charm** - Telegram бот с веб-интерфейсом, базой данных PostgreSQL и автоматическим деплоем.

---

## ⚡ Быстрый старт

### Вариант 1: Локальная разработка

```bash
# 1. Установите зависимости
npm install
pip install -r telegram_bot/requirements.txt

# 2. Настройте .env
cp .env.example .env
# Отредактируйте .env с вашими настройками

# 3. Запустите проект
npm run dev
python run_bot.py
```

### Вариант 2: Docker (локально)

```bash
# 1. Настройте .env
cp .env.example .env

# 2. Запустите с Docker
docker-compose up -d

# 3. Проверьте логи
docker-compose logs -f
```

### Вариант 3: Деплой на сервер (продакшн)

```bash
# На Ubuntu сервере:
curl -fsSL https://raw.githubusercontent.com/keystone4tech-blip/bot-db-charm/main/deploy/setup.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

**После setup:**
1. Отредактируйте `~/keystone_project/.env`
2. Перезапустите: `docker-compose down && docker-compose up -d`
3. Проверьте логи: `docker-compose logs -f`

---

## 📚 Документация

### 🎯 ДЕПЛОЙ (начните здесь!)

**[📖 DEPLOY_README.md](./DEPLOY_README.md)** - Главная навигация по всем инструкциям деплоя

### Инструкции по деплою:

- **[⚡ QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Быстрый деплой за 5 минут
- **[📚 DEPLOY_FULL_GUIDE.md](./DEPLOY_FULL_GUIDE.md)** - Полное руководство с объяснениями
- **[⚙️ GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)** - Настройка CI/CD
- **[❓ DEPLOY_FAQ.md](./DEPLOY_FAQ.md)** - Часто задаваемые вопросы

### Другая документация:

- [README.md](./README.md) - Общая информация о проекте
- [DEPLOYMENT_AUTOMATION_COMPLETE.md](./DEPLOYMENT_AUTOMATION_COMPLETE.md) - Сводка автоматизации

---

## 🛠️ Полезные команды

### Локальная разработка:

```bash
# Frontend
npm run dev         # Запуск dev сервера
npm run build       # Сборка для продакшн
npm run lint        # Линтинг кода

# Backend
node server.cjs     # Запуск backend

# Bot
python run_bot.py   # Запуск бота
```

### Docker:

```bash
# Запуск
docker-compose up -d

# Логи
docker-compose logs -f
docker-compose logs -f bot
docker-compose logs -f backend

# Перезапуск
docker-compose restart

# Остановка
docker-compose down

# Пересборка
docker-compose up -d --build
```

### На продакшн сервере:

```bash
# Быстрое обновление
./deploy/quick-update.sh

# Логи
docker-compose logs -f

# Статус
docker-compose ps

# Перезапуск
docker-compose restart
```

---

## 📊 Структура проекта

```
bot-db-charm/
├── telegram_bot/              # Telegram бот (Python)
│   ├── handlers/             # Обработчики команд
│   ├── keyboards/            # Клавиатуры
│   ├── states/              # FSM состояния
│   └── database/            # Работа с БД
│
├── src/                      # Frontend (React + TypeScript)
├── config/                   # Backend конфигурация
├── controllers/              # Backend контроллеры
├── routes/                   # Backend маршруты
├── services/                 # Backend сервисы
│
├── deploy/                   # 🚀 Скрипты деплоя
│   ├── setup.sh             # Главный setup
│   ├── quick-update.sh      # Быстрое обновление
│   └── generate-secrets.sh  # Генерация паролей
│
├── .github/workflows/        # GitHub Actions CI/CD
│
├── docker-compose.yml        # Docker конфигурация
├── Dockerfile.backend        # Backend образ
├── Dockerfile.bot           # Bot образ
├── .env.example             # Пример настроек
└── README.md                # Главный README
```

---

## 🔑 Переменные окружения (.env)

Обязательные:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
BOT_TOKEN=your_bot_token_from_botfather

# Database
DB_PASSWORD=your_secure_password
DB_NAME=keystone
DB_USER=postgres

# Admin
ADMIN_ID=your_telegram_id
ADMIN_IDS=your_telegram_id

# JWT
JWT_SECRET=your_random_secret_string
```

Генерация безопасных секретов:

```bash
./deploy/generate-secrets.sh
```

---

## 🎯 Что входит в проект?

### Компоненты:

- ✅ **Telegram Bot** (Python + Aiogram) - Telegram интерфейс
- ✅ **Backend API** (Node.js + Express) - RESTful API
- ✅ **Frontend** (React + TypeScript + Vite) - Веб-интерфейс
- ✅ **Database** (PostgreSQL 15) - База данных
- ✅ **Docker** - Контейнеризация
- ✅ **Nginx** - Веб-сервер и прокси
- ✅ **GitHub Actions** - CI/CD

### Возможности:

- 🔐 Регистрация пользователей через Telegram
- 👥 Реферальная система
- 📊 Админ панель
- 🔄 Автоматический деплой
- 🔒 SSL сертификаты (HTTPS)
- 📈 Логирование и мониторинг

---

## 🆘 Нужна помощь?

### Проблемы с деплоем?
См. [DEPLOY_FAQ.md](./DEPLOY_FAQ.md)

### Проблемы с кодом?
Создайте Issue в GitHub

### Хотите улучшить проект?
Создайте Pull Request!

---

## 🎉 Следующие шаги

1. **Локальная разработка:**
   - Склонируйте репозиторий
   - Установите зависимости
   - Настройте .env
   - Запустите проект

2. **Деплой на сервер:**
   - Подготовьте Ubuntu сервер
   - Запустите `deploy/setup.sh`
   - Настройте .env
   - Проверьте работу

3. **Настройте CI/CD:**
   - Создайте SSH ключи
   - Добавьте GitHub Secrets
   - Сделайте git push
   - Проверьте автоматический деплой

---

**Готовы начать? Выберите вариант выше! 🚀**

**Документация по деплою:** [DEPLOY_README.md](./DEPLOY_README.md)
