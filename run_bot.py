#!/usr/bin/env python3
"""
Файл для запуска Telegram бота
Использует абсолютные пути для избежания проблем с относительными импортами
"""

import asyncio
import sys
import os
import logging
from aiohttp import web

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Добавляем директорию проекта в путь для импорта
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_dir)

from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Импортируем бота и диспетчер
from telegram_bot.bot_instance import bot
from telegram_bot.dispatcher import dp

# Импортируем роутеры
from telegram_bot.handlers import komanda_start_router, callback_router

# Регистрируем роутеры
dp.include_router(komanda_start_router)
dp.include_router(callback_router)

# Импортируем базу данных
from telegram_bot.database import database

# Создаем веб-приложение для API
app = web.Application()

# Обработчик для отправки аутентификационного кода
async def send_auth_code(request):
    try:
        data = await request.json()
        telegram_id = data.get('telegramId')
        auth_code = data.get('authCode')

        if not telegram_id or not auth_code:
            return web.json_response({'error': 'telegramId and authCode are required'}, status=400)

        # Отправляем сообщение пользователю с кодом
        message_text = f"Ваш код для входа в приложение: <b>{auth_code}</b>\n\nВведите этот код на сайте для входа в аккаунт."

        await bot.send_message(chat_id=telegram_id, text=message_text, parse_mode='HTML')

        return web.json_response({'success': True, 'message': 'Auth code sent successfully'})
    except Exception as e:
        print(f"Error in send_auth_code: {e}")
        return web.json_response({'error': str(e)}, status=500)

# Добавляем маршрут
app.router.add_post('/send-auth-code', send_auth_code)

async def main():
    """
    Основная функция запуска бота
    """
    try:
        # Подключаемся к базе данных
        await database.connect()
        logger.info("Подключение к базе данных установлено")
    except Exception as e:
        logger.error(f"Ошибка подключения к базе данных: {e}")
        return

    # Запускаем веб-сервер для API в фоновом режиме
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, 'localhost', 3001)  # Используем порт 3001 для API бота
    await site.start()
    logger.info("Bot API server started at http://localhost:3001")

    try:
        logger.info("Запуск бота...")
        # Запускаем бота
        await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())
    except Exception as e:
        logger.error(f"Ошибка при работе бота: {e}")
    finally:
        # Закрываем соединение с базой данных при завершении
        try:
            await database.disconnect()
            logger.info("Соединение с базой данных закрыто")
        except Exception as e:
            logger.error(f"Ошибка при закрытии соединения с базой данных: {e}")

        # Останавливаем веб-сервер
        try:
            await runner.cleanup()
            logger.info("Bot API server stopped")
        except Exception as e:
            logger.error(f"Ошибка при остановке сервера: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Бот остановлен пользователем")
    except Exception as e:
        logger.error(f"Критическая ошибка: {e}")