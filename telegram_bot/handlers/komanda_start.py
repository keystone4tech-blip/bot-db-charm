from aiogram import Router
from aiogram.types import Message
from aiogram.filters import CommandStart
from aiogram.exceptions import TelegramNetworkError
from dotenv import load_dotenv
import logging

from ..keyboards import get_webapp_keyboard

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем роутер
komanda_start_router = Router()


@komanda_start_router.message(CommandStart())
async def komanda_start(message: Message) -> None:
    """Обработчик команды /start (включая реферальный параметр).

    Важно: учет реферала выполняется в Mini App при первой авторизации
    (через backend-функцию telegram-auth). Задача бота — ответить и открыть Mini App,
    прокинув параметр в ссылку кнопки.
    """

    try:
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
    except TelegramNetworkError as e:
        logger.error(f"Ошибка сети при отправке сообщения пользователю {message.from_user.id}: {e}")
        try:
            # Повторная попытка без клавиатуры
            await message.answer("Привет! Нажмите /start еще раз, если не получили кнопку.")
        except:
            pass  # Игнорируем ошибки при повторной отправке
    except Exception as e:
        logger.error(f"Неизвестная ошибка при обработке команды /start от пользователя {message.from_user.id}: {e}")
        try:
            await message.answer("Произошла ошибка. Пожалуйста, попробуйте еще раз.")
        except:
            pass  # Игнорируем ошибки при отправке сообщения об ошибке
