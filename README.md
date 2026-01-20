# Bot DB Charm

## Project info

**GitHub Repository**: https://github.com/keystone4tech-blip/bot-db-charm

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/keystone4tech-blip/bot-db-charm.git

# Step 2: Navigate to the project directory.
cd bot-db-charm

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## 🚀 Deployment

### Автоматизированный деплой на Ubuntu сервер

Мы создали полную автоматизацию деплоя с Docker, CI/CD и SSL!

**📖 Документация по деплою:**

- **[DEPLOY_README.md](DEPLOY_README.md)** - 🎯 НАЧНИТЕ ЗДЕСЬ - Навигация по всем инструкциям
- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - ⚡ Быстрый старт (5 минут)
- **[DEPLOY_FULL_GUIDE.md](DEPLOY_FULL_GUIDE.md)** - 📚 Полное руководство
- **[GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)** - ⚙️ Настройка GitHub Actions
- **[DEPLOY_FAQ.md](DEPLOY_FAQ.md)** - ❓ Часто задаваемые вопросы

**⚡ Быстрый деплой (один скрипт):**
```bash
# На Ubuntu сервере:
curl -fsSL https://raw.githubusercontent.com/keystone4tech-blip/bot-db-charm/main/deploy/setup.sh -o setup.sh && chmod +x setup.sh && ./setup.sh
```

**Что устанавливается автоматически:**
- ✅ Docker & Docker Compose
- ✅ Node.js, Python, PostgreSQL
- ✅ Nginx с SSL (Let's Encrypt)
- ✅ Автоматический деплой через GitHub Actions
- ✅ Все зависимости проекта

## Configuration

Before running the project, make sure to configure your `.env` file with the following settings:
- `BOT_TOKEN`: Your Telegram bot token from @BotFather
- `DB_PASSWORD`: Password for PostgreSQL database (default is 2046)
- `WEBAPP_URL`: Your domain URL (e.g., https://keystone-tech.ru)

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Node.js
- Python (Aiogram)
- PostgreSQL (local database)
- Docker
- Docker Compose

## 📱 Mobile App

Полнофункциональное мобильное приложение для Android и iOS на базе React Native и Expo.

**📖 Документация по мобильному приложению:**

- **[mobile-app/README.md](mobile-app/README.md)** - 🎯 Обзор и быстрый старт
- **[mobile-app/SETUP.md](mobile-app/SETUP.md)** - ⚙️ Полная инструкция по настройке
- **[mobile-app/BUILD.md](mobile-app/BUILD.md)** - 📦 Инструкция по сборке APK/AAB/IPA

**🚀 Возможности:**
- 🔐 Аутентификация через Telegram ID
- 🔑 Управление VPN ключами
- 💬 Управление Telegram каналами
- 👥 Реферальная программа
- 🔔 Push уведомления через Firebase
- 🔄 OTA обновления через Expo Updates
- 📊 Админ панель

**⚡ Быстрый запуск:**
```bash
cd mobile-app
npm install
npm start
```

**📦 Сборка для Android:**
```bash
npm run build:apk
```
