from aiogram import Router
from aiogram.types import Message
from aiogram.filters import CommandStart
from dotenv import load_dotenv

from ..keyboards import get_webapp_keyboard

# Загружаем переменные окружения
load_dotenv()

# Создаем роутер
komanda_start_router = Router()


@komanda_start_router.message(CommandStart())
async def komanda_start(message: Message) -> None:
    """Обработчик команды /start (включая реферальный параметр).

    Важно: учет реферала выполняется в Mini App при первой авторизации
    (через backend-функцию telegram-auth). Задача бота — ответить и открыть Mini App,
    прокинув параметр в ссылку кнопки.
    """

    # /start <param>
    start_param = message.text.split(maxsplit=1)[1] if len(message.text.split()) > 1 else None

    user_full_name = message.from_user.full_name

    if start_param:
        welcome_text = (
            f"Привет, {user_full_name}! 👋\n\n"
            "Вы перешли по реферальной ссылке. Нажмите кнопку ниже, чтобы открыть приложение:"
        )
        await message.answer(welcome_text, reply_markup=get_webapp_keyboard(start_param))
        return

    welcome_text = (
        f"Привет, {user_full_name}! 👋\n\n"
        "Нажмите кнопку ниже, чтобы открыть приложение:"
    )
    await message.answer(welcome_text, reply_markup=get_webapp_keyboard())
