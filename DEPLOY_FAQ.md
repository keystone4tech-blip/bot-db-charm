# ❓ FAQ - Частые вопросы по деплою

---

## Общие вопросы

### Q: Нужен ли мне домен?

**A:** Нет, домен опционален. Вы можете использовать проект по IP адресу сервера.

- **С доменом:** `https://yourdomain.com`
- **Без домена:** `http://123.45.67.89:3000`

SSL сертификат можно получить только для домена.

---

### Q: Какая минимальная конфигурация сервера?

**A:** Рекомендуется:
- **RAM:** минимум 1GB, рекомендуется 2GB
- **CPU:** минимум 1 core, рекомендуется 2 cores
- **Диск:** минимум 10GB свободного места
- **ОС:** Ubuntu 20.04 или 22.04

---

### Q: Можно ли использовать другую ОС?

**A:** Setup скрипт оптимизирован для Ubuntu. Для других ОС:
- **Debian:** Должен работать с минимальными изменениями
- **CentOS/RHEL:** Потребуется изменить команды установки (apt → yum)
- **Windows Server:** Не поддерживается, используйте WSL2

---

### Q: Сколько времени занимает первая установка?

**A:** 
- Запуск setup скрипта: **5-10 минут**
- Настройка .env: **2-3 минуты**
- Первый запуск контейнеров: **3-5 минут**
- **Всего: 10-20 минут**

---

## Docker

### Q: Как посмотреть логи конкретного контейнера?

**A:**
```bash
docker-compose logs -f backend   # Backend логи
docker-compose logs -f bot       # Bot логи
docker-compose logs -f postgres  # Database логи

# Последние 100 строк
docker-compose logs --tail=100 backend

# С временными метками
docker-compose logs -f -t backend
```

---

### Q: Контейнер постоянно перезапускается

**A:** Проверьте логи:
```bash
docker-compose logs контейнер_имя
```

Частые причины:
1. Неправильные переменные в .env
2. База данных не готова (добавьте `depends_on` с `condition: service_healthy`)
3. Ошибка в коде
4. Порт уже занят

---

### Q: Как полностью очистить Docker?

**A:**
```bash
# Остановить все контейнеры
docker-compose down

# Удалить все контейнеры
docker rm -f $(docker ps -aq)

# Удалить все образы
docker rmi -f $(docker images -q)

# Удалить volumes (ВНИМАНИЕ: потеряете данные БД!)
docker volume rm $(docker volume ls -q)

# Очистить всё неиспользуемое
docker system prune -a --volumes
```

---

### Q: Как обновить только один контейнер?

**A:**
```bash
# Пересобрать и перезапустить только backend
docker-compose up -d --build --force-recreate backend

# Или только bot
docker-compose up -d --build --force-recreate bot
```

---

## База данных

### Q: Как подключиться к PostgreSQL?

**A:**
```bash
# Через Docker
docker-compose exec postgres psql -U postgres -d keystone

# Полезные команды в psql:
\dt          # Список таблиц
\d users     # Структура таблицы users
\q           # Выход
```

---

### Q: Как сделать бэкап базы данных?

**A:**
```bash
# Создать бэкап
docker-compose exec -T postgres pg_dump -U postgres keystone > backup_$(date +%Y%m%d).sql

# Восстановить из бэкапа
cat backup_20240120.sql | docker-compose exec -T postgres psql -U postgres keystone
```

---

### Q: База данных не запускается

**A:** Проверьте:

1. Логи PostgreSQL:
```bash
docker-compose logs postgres
```

2. Права на volume:
```bash
docker volume inspect keystone_project_postgres_data
```

3. Попробуйте пересоздать контейнер:
```bash
docker-compose down
docker volume rm keystone_project_postgres_data
docker-compose up -d
```

⚠️ **ВНИМАНИЕ:** Это удалит все данные!

---

## GitHub Actions

### Q: GitHub Actions не запускается

**A:** Проверьте:

1. Файл workflow существует: `.github/workflows/deploy.yml`
2. Вы делаете push в правильную ветку (main или master)
3. Actions включены в настройках репозитория: **Settings → Actions → General**

---

### Q: Ошибка "Permission denied" в GitHub Actions

**A:**

1. Проверьте PUBLIC ключ на сервере:
```bash
cat ~/.ssh/authorized_keys
```

2. Проверьте права:
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

3. Проверьте SECRET `SERVER_SSH_KEY` в GitHub - должен содержать весь PRIVATE ключ

---

### Q: Как остановить автоматический деплой?

**A:**

**Вариант 1:** Удалите или переименуйте workflow файл:
```bash
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled
git add .
git commit -m "Disable auto-deploy"
git push
```

**Вариант 2:** Отключите в GitHub:
**Settings → Actions → General → Disable Actions**

---

### Q: Как деплоить вручную?

**A:**

На сервере:
```bash
cd ~/keystone_project
git pull origin main
docker-compose down
docker-compose up -d --build
```

Или используйте quick-update скрипт:
```bash
./deploy/quick-update.sh
```

---

## Nginx и SSL

### Q: Как проверить конфигурацию Nginx?

**A:**
```bash
# Проверить синтаксис
sudo nginx -t

# Посмотреть конфигурацию
sudo cat /etc/nginx/sites-available/yourdomain.com

# Перезагрузить Nginx
sudo systemctl reload nginx

# Статус Nginx
sudo systemctl status nginx
```

---

### Q: SSL сертификат не получен

**A:** Проверьте:

1. DNS указывает на сервер:
```bash
nslookup yourdomain.com
# Должен вернуть IP вашего сервера
```

2. Порты 80 и 443 открыты:
```bash
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

3. Nginx работает:
```bash
sudo systemctl status nginx
```

4. Попробуйте получить сертификат вручную:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### Q: SSL сертификат истекает

**A:**

Certbot автоматически обновляет сертификаты. Проверьте:

```bash
# Проверить статус
sudo certbot certificates

# Обновить вручную
sudo certbot renew

# Тест обновления
sudo certbot renew --dry-run

# Проверить cron задачу
cat /etc/cron.d/certbot-renewal
```

---

### Q: Nginx показывает 502 Bad Gateway

**A:**

1. Проверьте, что backend запущен:
```bash
docker-compose ps backend
```

2. Проверьте логи backend:
```bash
docker-compose logs backend
```

3. Проверьте порт:
```bash
curl http://localhost:3000
```

4. Перезапустите backend:
```bash
docker-compose restart backend
```

5. Проверьте логи Nginx:
```bash
sudo tail -f /var/log/nginx/error.log
```

---

## Telegram Bot

### Q: Бот не отвечает

**A:**

1. Проверьте логи бота:
```bash
docker-compose logs -f bot
```

2. Проверьте токен в .env:
```bash
grep TELEGRAM_BOT_TOKEN .env
```

3. Проверьте, что контейнер запущен:
```bash
docker-compose ps bot
```

4. Перезапустите бота:
```bash
docker-compose restart bot
```

---

### Q: Ошибка "Conflict: terminated by other getUpdates request"

**A:**

Это значит, что бот запущен в нескольких местах одновременно.

Решение:
1. Остановите все запущенные версии бота
2. Проверьте, нет ли бота на другом сервере
3. Перезапустите:
```bash
docker-compose down
docker-compose up -d
```

---

### Q: Как получить мой Telegram ID?

**A:**

1. Напишите боту [@userinfobot](https://t.me/userinfobot)
2. Он ответит с вашим ID
3. Добавьте ID в .env файл в переменную `ADMIN_ID`

---

## Безопасность

### Q: Как изменить пароль базы данных?

**A:**

1. Остановите контейнеры:
```bash
docker-compose down
```

2. Измените в .env:
```bash
nano .env
# Измените DB_PASSWORD
```

3. Удалите старый volume (ВНИМАНИЕ: удалит данные!):
```bash
docker volume rm keystone_project_postgres_data
```

4. Запустите заново:
```bash
docker-compose up -d
```

**Или сохраните данные:**

1. Сделайте бэкап
2. Измените пароль в .env
3. Пересоздайте БД
4. Восстановите из бэкапа

---

### Q: Как настроить firewall?

**A:**
```bash
# Установить UFW
sudo apt install ufw

# Разрешить SSH (ВАЖНО: сделайте это первым!)
sudo ufw allow 22/tcp

# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включить firewall
sudo ufw enable

# Проверить статус
sudo ufw status
```

---

### Q: .env файл виден в GitHub!

**A:**

**ВАЖНО:** Никогда не коммитьте .env файл!

Если случайно закоммитили:

1. Удалите из git:
```bash
git rm --cached .env
git commit -m "Remove .env from repository"
git push
```

2. Убедитесь, что .env в .gitignore:
```bash
echo ".env" >> .gitignore
```

3. **ИЗМЕНИТЕ ВСЕ СЕКРЕТЫ** в .env (пароли, токены, ключи)

---

## Производительность

### Q: Сервер работает медленно

**A:**

1. Проверьте использование ресурсов:
```bash
docker stats
htop
df -h
```

2. Очистите Docker:
```bash
docker system prune -a
```

3. Проверьте логи на ошибки:
```bash
docker-compose logs
```

4. Рассмотрите увеличение RAM/CPU сервера

---

### Q: База данных занимает много места

**A:**

```bash
# Проверить размер
docker exec keystone_postgres du -sh /var/lib/postgresql/data

# Очистить старые логи PostgreSQL
docker exec keystone_postgres find /var/lib/postgresql/data/pg_log -type f -mtime +7 -delete
```

---

## Обновления

### Q: Как обновить версию Node.js/Python?

**A:**

Измените в Dockerfile:

**Dockerfile.backend:**
```dockerfile
FROM node:20-alpine  # Было: node:18-alpine
```

**Dockerfile.bot:**
```dockerfile
FROM python:3.12-slim  # Было: python:3.11-slim
```

Затем пересоберите:
```bash
docker-compose up -d --build
```

---

### Q: Как обновить зависимости проекта?

**A:**

**Backend (Node.js):**
```bash
npm update
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Bot (Python):**
```bash
pip install -r telegram_bot/requirements.txt --upgrade
pip freeze > telegram_bot/requirements.txt
git add telegram_bot/requirements.txt
git commit -m "Update Python dependencies"
git push
```

---

## Мониторинг

### Q: Как настроить мониторинг?

**A:**

Можно добавить Portainer для управления Docker:

```bash
docker volume create portainer_data
docker run -d -p 9000:9000 \
  --name portainer \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

Откройте: `http://your-server-ip:9000`

---

### Q: Как получать уведомления об ошибках?

**A:**

Добавьте Sentry или другой сервис мониторинга:

1. Зарегистрируйтесь на [sentry.io](https://sentry.io)
2. Создайте проект
3. Добавьте DSN в .env
4. Интегрируйте в код

---

## Еще вопросы?

Создайте Issue в GitHub репозитории или проверьте:
- [DEPLOY_FULL_GUIDE.md](./DEPLOY_FULL_GUIDE.md)
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
