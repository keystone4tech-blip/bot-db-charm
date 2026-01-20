# ⚡ БЫСТРЫЙ ДЕПЛОЙ НА UBUNTU СЕРВЕР

## За 5 минут: от пустого сервера до работающего бота!

---

## ШАГ 1: На сервере - Запустите один скрипт

```bash
# Подключитесь к серверу
ssh root@your-server-ip

# Скачайте и запустите setup скрипт
curl -fsSL https://raw.githubusercontent.com/ВАШ-НИК/ВАШ-РЕПО/main/deploy/setup.sh -o setup.sh && chmod +x setup.sh && ./setup.sh
```

**Следуйте инструкциям скрипта!**

---

## ШАГ 2: Отредактируйте .env

```bash
nano ~/keystone_project/.env
```

**Измените:**
- `DB_PASSWORD` → Ваш пароль
- `TELEGRAM_BOT_TOKEN` → Токен от BotFather
- `BOT_TOKEN` → Тот же токен
- `ADMIN_ID` → Ваш Telegram ID
- `ADMIN_IDS` → Ваш Telegram ID

Сохраните: `Ctrl+X`, `Y`, `Enter`

---

## ШАГ 3: Перезапустите контейнеры

```bash
cd ~/keystone_project
docker-compose down
docker-compose up -d --build
```

---

## ШАГ 4: Проверьте статус

```bash
docker-compose ps
docker-compose logs -f bot
```

---

## ШАГ 5: Настройте GitHub Actions (ОПЦИОНАЛЬНО)

### На локальном компьютере:

```bash
# Создайте SSH ключ
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""

# Скопируйте PUBLIC ключ
cat ~/.ssh/deploy_key.pub
```

### На сервере:

```bash
# Добавьте public ключ
echo "ваш_public_ключ" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### На GitHub:

1. Перейдите: **Settings → Secrets → Actions**
2. Добавьте секреты:
   - `SERVER_IP` = IP сервера
   - `SERVER_USER` = root или ubuntu
   - `SERVER_SSH_KEY` = содержимое `~/.ssh/deploy_key` (PRIVATE ключ)
   - `SERVER_PORT` = 22

---

## ГОТОВО! 🎉

**Теперь:**
- ✅ Бот работает
- ✅ Backend запущен
- ✅ База данных настроена
- ✅ Автоматический деплой работает (если настроили GitHub Actions)

**Протестируйте:**
```bash
# Отправьте /start вашему боту в Telegram
# Проверьте API
curl http://localhost:3000/api/users
```

---

## ПОЛЕЗНЫЕ КОМАНДЫ

```bash
# Логи
docker-compose logs -f
docker-compose logs -f bot
docker-compose logs -f backend

# Перезапуск
docker-compose restart

# Быстрое обновление
./deploy/quick-update.sh

# Статус
docker-compose ps
```

---

**Полная документация:** См. файл [DEPLOY_FULL_GUIDE.md](./DEPLOY_FULL_GUIDE.md)
