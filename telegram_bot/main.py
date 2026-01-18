import asyncio
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Импортируем бота и диспетчер
from telegram_bot.bot_instance import bot
from telegram_bot.dispatcher import dp

# Импортируем роутеры
from telegram_bot.handlers import komanda_start_router, callback_router, start_router

# Регистрируем роутеры (в порядке приоритета)
# start_router имеет приоритет, так как использует FSM
dp.include_router(start_router)
dp.include_router(komanda_start_router)
dp.include_router(callback_router)

# Импортируем базу данных
from telegram_bot.database import database

async def main():
    """
    Основная функция запуска бота
    """
    # Подключаемся к базе данных
    await database.connect()
    
    try:
        # Запускаем бота
        await dp.start_polling(bot)
    finally:
        # Закрываем соединение с базой данных при завершении
        await database.disconnect()

if __name__ == "__main__":
    asyncio.run(main())