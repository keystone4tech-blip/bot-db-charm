from aiogram import Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage

# Импортируем роутеры
from telegram_bot.handlers.start_handler import start_router
from telegram_bot.handlers.otp_handler import otp_router

# Создаем хранилище состояний
storage = MemoryStorage()

# Создаем диспетчер
dp = Dispatcher(storage=storage)

# Регистрируем роутеры
dp.include_router(start_router)
dp.include_router(otp_router)