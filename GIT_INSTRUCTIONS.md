# Инструкция по синхронизации с GitHub

## Состояние репозитория

Локальные изменения уже закоммичены с сообщением:
```
"Add Telegram bot setup files and improve referral link generation"
```

## Необходимые действия для синхронизации

1. Убедитесь, что у вас есть права на запись в репозиторий `https://github.com/keystone4tech-blip/bot-db-charm.git`

2. Если у вас есть права, выполните следующие команды в терминале:

```bash
git remote set-url origin https://github.com/keystone4tech-blip/bot-db-charm.git
git push -u origin main
```

3. Если у вас нет прав на запись в основной репозиторий:

   - Сделайте fork репозитория себе
   - Добавьте свой fork как удаленный репозиторий:
     ```bash
     git remote add myfork https://github.com/ваш-логин/bot-db-charm.git
     ```
   - Отправьте изменения в ваш fork:
     ```bash
     git push -u myfork main
     ```
   - Создайте Pull Request в основной репозиторий

## Альтернативный способ (если нет доступа к командной строке):

1. Создайте архив с текущими файлами проекта
2. Загрузите его в GitHub через веб-интерфейс
3. Создайте новый коммит с этими файлами

## Что было добавлено:

- `bot_setup.py` - файл с настройками Telegram бота с поддержкой реферальных параметров
- `requirements.txt` - зависимости для запуска бота (aiogram 3)
- `src/types/telegram.d.ts` - типизация для Telegram WebApp
- `src/vite-env.d.ts` - типизация переменных окружения
- Изменения в `src/hooks/useProfile.ts` - улучшенная генерация реферальных ссылок
- Изменения в `.env` - добавлена переменная для имени бота