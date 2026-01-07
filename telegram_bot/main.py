import asyncio
from aiogram import Bot, Dispatcher
from aiogram.types import Message
from aiogram.filters import CommandStart
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
import os
import logging
from typing import Optional

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Импортируем настройки
from dotenv import load_dotenv
from .database import database

load_dotenv()

# Получаем токен бота из переменных окружения
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# URL для WebApp
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-app-domain.com")

# Создаем бота и диспетчер
bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
storage = MemoryStorage()
dp = Dispatcher(storage=storage)

async def register_user_if_not_exists(telegram_id: int, first_name: str, last_name: str = None, 
                                   username: str = None, avatar_url: str = None, 
                                   referral_code: str = None) -> tuple:
    """
    Регистрирует пользователя, если он не существует
    Возвращает (user_data, is_new_user)
    """
    # Проверяем, существует ли пользователь
    existing_user = await database.get_user_by_telegram_id(telegram_id)
    
    if existing_user:
        # Обновляем данные пользователя, если они изменились
        # (например, имя пользователя могло измениться)
        return existing_user, False
    
    # Генерируем уникальный реферальный код для нового пользователя
    import secrets
    import string
    new_referral_code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    
    # Проверяем, есть ли пользователь, который пригласил (по реферальному коду)
    referrer_id = None
    if referral_code:
        referrer = await database.get_user_referral_code(referral_code)
        if referrer:
            referrer_id = referrer['id']
    
    # Создаем нового пользователя
    new_user = await database.create_user(
        telegram_id=telegram_id,
        first_name=first_name,
        last_name=last_name,
        username=username,
        avatar_url=avatar_url,
        referral_code=new_referral_code,
        referred_by=referrer_id
    )
    
    # Если пользователь был приглашен кем-то, создаем запись о реферале
    if referrer_id and new_user:
        await database.create_referral_record(referrer_id, new_user['id'], 1)
    
    return new_user, True

@dp.message(CommandStart())
async def command_start_handler(message: Message) -> None:
    """
    Обработчик команды /start с параметрами
    """
    # Получаем параметр из команды /start
    start_param = message.text.split(maxsplit=1)[1] if len(message.text.split()) > 1 else None
    
    user_id = message.from_user.id
    user_name = message.from_user.first_name
    user_full_name = message.from_user.full_name
    username = message.from_user.username
    avatar_url = None  # Telegram API не предоставляет аватар напрямую
    
    # Регистрируем пользователя, если он еще не зарегистрирован
    user_data, is_new_user = await register_user_if_not_exists(
        telegram_id=user_id,
        first_name=user_name,
        last_name=message.from_user.last_name,
        username=username,
        avatar_url=avatar_url,
        referral_code=start_param
    )
    
    # Если есть реферальный параметр
    if start_param and is_new_user:
        # Логируем реферальный переход
        print(f"Пользователь {user_full_name} (ID: {user_id}) перешел по реферальной ссылке с параметром: {start_param}")
        
        # Отправляем приветственное сообщение с информацией о переходе в приложение
        welcome_text = f"""
Привет, {user_full_name}! 👋

Вы перешли по реферальной ссылке и будете перенаправлены в приложение.
Нажмите кнопку ниже для перехода:
        """
        
        # Отправляем сообщение с WebApp
        await message.answer(
            welcome_text,
            reply_markup=get_webapp_keyboard(start_param)
        )
    elif is_new_user:
        # Если нет реферального параметра, но пользователь новый
        welcome_text = f"""
Привет, {user_full_name}! 👋

Добро пожаловать в наше приложение! 
Для начала работы нажмите кнопку ниже:
        """
        
        await message.answer(
            welcome_text,
            reply_markup=get_webapp_keyboard()
        )
    else:
        # Если пользователь уже существует
        welcome_text = f"""
Привет, {user_full_name}! 👋

Вы уже зарегистрированы в системе. 
Нажмите кнопку ниже для открытия приложения:
        """
        
        await message.answer(
            welcome_text,
            reply_markup=get_webapp_keyboard()
        )

def get_webapp_keyboard(start_param: Optional[str] = None):
    """
    Создает клавиатуру с кнопкой для открытия WebApp
    """
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    
    # Формируем URL для WebApp с параметром startapp
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
    # Для всех других сообщений
    await message.answer(
        "Нажмите кнопку ниже, чтобы открыть приложение:",
        reply_markup=get_webapp_keyboard()
    )

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