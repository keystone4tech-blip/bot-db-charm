#!/usr/bin/env python3
"""
Файл для запуска Telegram бота
Использует абсолютные пути для избежания проблем с относительными импортами
"""

import asyncio
import sys
import os
import logging

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
from telegram_bot.handlers import komanda_start_router

# Регистрируем роутеры
dp.include_router(komanda_start_router)

# Импортируем базу данных
from telegram_bot.database import database

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

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Бот остановлен пользователем")
    except Exception as e:
        logger.error(f"Критическая ошибка: {e}")