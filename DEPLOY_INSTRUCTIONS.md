# Деплой проекта на сервер для keystone-tech.ru

## Подготовка сервера

1. Подключитесь к вашему Ubuntu-серверу:
```bash
ssh root@ваш_IP_адрес
```

2. Установите curl если он не установлен:
```bash
sudo apt update
sudo apt install -y curl
```

## Установка проекта

1. Скачайте и запустите основной установочный скрипт:
```bash
curl -fsSL https://raw.githubusercontent.com/keystone4tech-blip/bot-db-charm/main/deploy/setup.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

2. При запросе укажите URL репозитория:
```
https://github.com/keystone4tech-blip/bot-db-charm.git
```

3. При запросе настройки SSL укажите:
- Домен: `keystone-tech.ru`
- Email: `m.v.s.4@mail.ru`

## Проверка установки

1. Проверьте статус контейнеров:
```bash
cd ~/keystone_project
docker-compose ps
```

2. Проверьте логи:
```bash
docker-compose logs -f
```

## Настройка домена

1. На панели управления вашего домена (например, Reg.ru, Namecheap) создайте DNS-записи:
   - A-запись: @ → ваш_IP_адрес
   - A-запись: www → ваш_IP_адрес

2. После активации DNS-записей (до 24 часов) сайт станет доступен по адресу https://keystone-tech.ru

## Настройка автоматического деплоя через GitHub Actions

1. На вашем локальном компьютере сгенерируйте SSH-ключи:
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""
```

2. Скопируйте публичный ключ:
```bash
cat ~/.ssh/deploy_key.pub
```

3. На сервере добавьте публичный ключ в authorized_keys:
```bash
echo "ваш_публичный_ключ" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

4. В GitHub-репозитории добавьте следующие секреты в Settings → Secrets and variables → Actions:
   - `SERVER_IP` = ваш_IP_адрес
   - `SERVER_USER` = root
   - `SERVER_SSH_KEY` = содержимое файла ~/.ssh/deploy_key (весь приватный ключ)
   - `SERVER_PORT` = 22

## Полезные команды

- Проверить статус: `docker-compose ps`
- Посмотреть логи: `docker-compose logs -f`
- Перезапустить: `docker-compose restart`
- Быстрое обновление: `~/keystone_project/deploy/quick-update.sh`
- Остановить: `docker-compose down`
- Пересобрать: `docker-compose up -d --build`

## Мониторинг и безопасность

1. Настройте firewall:
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

2. Регулярно обновляйте систему:
```bash
sudo apt update && sudo apt upgrade -y
```

## Тестирование автоматического обновления

1. Сделайте тестовый коммит в ваш репозиторий:
```bash
echo "# Test deploy" >> README.md
git add .
git commit -m "Test: automatic deploy"
git push origin main
```

2. Проверьте в GitHub Actions (вкладка Actions в репозитории), что workflow запустился и успешно завершился

3. Проверьте на сервере, что контейнеры пересобрались:
```bash
docker-compose ps
docker-compose logs --tail=20 backend
docker-compose logs --tail=20 bot
```

Теперь ваша система полностью автоматизирована:
- При пуше в GitHub репозиторий автоматически обновляются все компоненты
- При сбоях контейнеры автоматически перезапускаются
- SSL-сертификат автоматически обновляется
- Система мониторит состояние и восстанавливает работоспособность