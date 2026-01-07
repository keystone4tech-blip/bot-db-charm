import asyncio
from aiogram import Bot, Dispatcher
from aiogram.types import Message
from aiogram.filters import CommandStart
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.enums import ParseMode
import re
import logging

# Включаем логирование
logging.basicConfig(level=logging.INFO)

# Импортируем настройки
import os
from dotenv import load_dotenv

load_dotenv()

# Получаем токен бота из переменных окружения
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# URL для WebApp
WEBAPP_URL = "https://bot-db-charm.lovable.app/"  # Замените на ваш домен

# Создаем бота и диспетчер
from aiogram.client.default import DefaultBotProperties
bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
storage = MemoryStorage()
dp = Dispatcher(storage=storage)

@dp.message(CommandStart())
async def command_start_handler(message: Message) -> None:
    """
    Обработчик команды /start с параметрами
    """
    # Получаем параметр из команды /start
    start_param = message.text.split()[1] if len(message.text.split()) > 1 else None
    
    user_id = message.from_user.id
    user_name = message.from_user.full_name
    
    # Если есть реферальный параметр
    if start_param:
        # Логируем реферальный переход
        print(f"Пользователь {user_name} (ID: {user_id}) перешел по реферальной ссылке с параметром: {start_param}")
        
        # Отправляем приветственное сообщение с информацией о переходе в приложение
        welcome_text = f"""
Привет, {user_name}! 👋

Вы перешли по реферальной ссылке и будете перенаправлены в приложение.
Нажмите кнопку ниже для перехода:
        """
        
        # Отправляем сообщение с WebApp
        await message.answer(
            welcome_text,
            reply_markup=get_webapp_keyboard(start_param)
        )
    else:
        # Если нет реферального параметра
        welcome_text = f"""
Привет, {user_name}! 👋

Добро пожаловать в наше приложение! 
Для начала работы нажмите кнопку ниже:
        """
        
        await message.answer(
            welcome_text,
            reply_markup=get_webapp_keyboard()
        )

def get_webapp_keyboard(start_param=None):
    """
    Создает клавиатуру с кнопкой для открытия WebApp
    """
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    # Формируем URL для WebApp с параметром start
    webapp_url = WEBAPP_URL
    if start_param:
        webapp_url = f"{WEBAPP_URL}?startapp={start_param}"
    else:
        webapp_url = f"{WEBAPP_URL}"
    
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📱 Открыть приложение",
                    web_app={"url": webapp_url}
                )
            ]
        ]
    )
    
    return keyboard


@dp.message()
async def handle_message(message: Message) -> None:
    """
    Обработчик всех остальных сообщений
    """
    # Проверяем, является ли сообщение командой /start (хотя это не должно сработать, так как /start обрабатывается выше)
    if message.text and message.text.startswith('/start'):
        start_param = message.text.split()[1] if len(message.text.split()) > 1 else None
        
        if start_param:
            # Логируем реферальный переход
            print(f"Пользователь {message.from_user.full_name} (ID: {message.from_user.id}) перешел по реферальной ссылке с параметром: {start_param}")
            
            # Отправляем сообщение с информацией о переходе в приложение
            welcome_text = f"""
Привет, {message.from_user.full_name}! 👋

Вы перешли по реферальной ссылке и будете перенаправлены в приложение.
Нажмите кнопку ниже для перехода:
            """
            
            await message.answer(
                welcome_text,
                reply_markup=get_webapp_keyboard(start_param)
            )
        else:
            # Если нет реферального параметра
            welcome_text = f"""
Привет, {message.from_user.full_name}! 👋

Добро пожаловать в наше приложение! 
Нажмите кнопку ниже для начала работы:
            """
            
            await message.answer(
                welcome_text,
                reply_markup=get_webapp_keyboard()
            )
    else:
        # Для всех других сообщений
        await message.answer(
            "Нажмите кнопку ниже, чтобы открыть приложение:",
            reply_markup=get_webapp_keyboard()
        )

async def main():
    """
    Основная функция запуска бота
    """
    # Запускаем бота
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())