from aiogram import Router
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import CommandStart
from aiogram.exceptions import TelegramNetworkError
from dotenv import load_dotenv
import logging

from ..database import database
from ..keyboards import get_webapp_keyboard
from ..utils.message_helpers import send_welcome_message, send_error_message

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем роутер
komanda_start_router = Router()

def create_confirmation_keyboard(referrer_code: str = None):
    """Создает inline-клавиатуру для подтверждения/отказа"""
    if referrer_code:
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(text="✅ Подтвердить", callback_data=f"confirm_referral:{referrer_code}"),
                    InlineKeyboardButton(text="❌ Отказаться", callback_data="reject_referral")
                ]
            ]
        )
    else:
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(text="➡️ Продолжить", callback_data="continue_without_referral"),
                ]
            ]
        )
    return keyboard

@komanda_start_router.message(CommandStart())
async def komanda_start(message: Message) -> None:
    """Обработчик команды /start (включая реферальный параметр).

    Проверяет, существует ли пользователь в базе данных, и предлагает соответствующие действия.
    """
    try:
        # Логируем получение команды /start
        logger.info(f"Получена команда /start от пользователя {message.from_user.id} (@{message.from_user.username or 'N/A'})")
        logger.info(f"Полный текст сообщения: {message.text}")

        # /start <param>
        start_param = message.text.split(maxsplit=1)[1] if len(message.text.split()) > 1 else None
        logger.info(f"Извлечен реферальный параметр: {start_param}")

        user_full_name = message.from_user.full_name
        logger.info(f"Имя пользователя: {user_full_name}")

        # Проверяем, существует ли пользователь в базе данных
        logger.info("Проверка существования пользователя в базе данных...")
        existing_user = await database.get_user_by_telegram_id(message.from_user.id)
        logger.info(f"Результат проверки существования пользователя: {existing_user is not None}")

        if existing_user:
            # Пользователь уже существует в базе данных
            logger.info(f"Пользователь {message.from_user.id} уже существует в базе данных")
            welcome_text = (
                f"Привет, {user_full_name}! 👋\n\n"
                "Рады снова вас видеть! Нажмите кнопку ниже, чтобы открыть приложение:"
            )
            await message.answer(welcome_text, reply_markup=get_webapp_keyboard())
            logger.info(f"Отправлено сообщение существующему пользователю {message.from_user.id}")
            return
        else:
            logger.info(f"Пользователь {message.from_user.id} не найден в базе данных")
            # Создаем пользователя без реферала, если он не существует
            # Это нужно для пользователей, которые просто нажали /start без реферального кода
            if not start_param:
                logger.info(f"Создание пользователя без реферала для {message.from_user.id}")
                user_data = await database.create_user(
                    telegram_id=message.from_user.id,
                    first_name=user_full_name.split()[0] if user_full_name.split() else user_full_name,
                    last_name=' '.join(user_full_name.split()[1:]) if len(user_full_name.split()) > 1 else None,
                    username=message.from_user.username,
                    referral_code=None
                )
                logger.info(f"Результат создания пользователя: {user_data is not None}")

                if user_data:
                    await send_welcome_message(
                        user_id=message.from_user.id,
                        full_name=user_full_name,
                        message=message,
                        keyboard=get_webapp_keyboard()
                    )
                    logger.info(f"Пользователь {message.from_user.id} зарегистрирован без реферала")
                    return
                else:
                    logger.error(f"Не удалось создать пользователя {message.from_user.id}")
                    await send_error_message(
                        user_id=message.from_user.id,
                        message=message,
                        error_text="Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз."
                    )
                    return

        # Пользователь новый
        logger.info(f"Обработка нового пользователя с реферальным параметром: {start_param}")
        if start_param:
            # Пользователь пришел по реферальной ссылке
            # Проверяем, существует ли пользователь с таким реферальным кодом
            logger.info(f"Поиск реферала по коду: {start_param}")
            referrer = await database.get_user_by_referral_code(start_param)
            logger.info(f"Результат поиска реферала: {referrer is not None}")

            if referrer:
                referrer_name = f"{referrer.get('first_name', '')} {referrer.get('last_name', '')}".strip()
                if not referrer_name:
                    referrer_name = referrer.get('telegram_username', 'неизвестный пользователь')

                logger.info(f"Найден реферал: {referrer_name}")
                welcome_text = (
                    f"Привет, {user_full_name}! 👋\n\n"
                    f"Вы перешли по реферальной ссылке пользователя {referrer_name}.\n\n"
                    "Подтвердите, что хотите быть закреплены за этим рефералом:"
                )

                keyboard = create_confirmation_keyboard(start_param)  # Передаем реферальный код
                await message.answer(welcome_text, reply_markup=keyboard)
                logger.info("Отправлено сообщение с подтверждением реферала")
            else:
                # Реферальный код не найден, предлагаем продолжить без реферала
                logger.info("Реферальный код не найден, предлагаем продолжить без реферала")
                welcome_text = (
                    f"Привет, {user_full_name}! 👋\n\n"
                    "Вы перешли по ссылке, но реферальный код не найден.\n"
                    "Хотите продолжить без реферала и быть закрепленным за администратором бота?"
                )

                keyboard = create_confirmation_keyboard()
                await message.answer(welcome_text, reply_markup=keyboard)
                logger.info("Отправлено сообщение с предложением продолжить без реферала")
        else:
            # Пользователь пришел без реферального кода
            logger.info("Пользователь пришел без реферального кода")
            welcome_text = (
                f"Привет, {user_full_name}! 👋\n\n"
                "Вы перешли в бота не по реферальной ссылке.\n"
                "Хотите пройти по реферальной ссылке или продолжить и быть закрепленным за администратором бота?"
            )

            keyboard = create_confirmation_keyboard()
            await message.answer(welcome_text, reply_markup=keyboard)
            logger.info("Отправлено сообщение с предложением пройти по реферальной ссылке")

        logger.info("Обработка команды /start завершена успешно")
    except TelegramNetworkError as e:
        logger.error(f"Ошибка сети при отправке сообщения пользователю {message.from_user.id}: {e}")
        try:
            # Повторная попытка без клавиатуры
            await message.answer("Привет! Нажмите /start еще раз, если не получили кнопку.")
        except:
            pass  # Игнорируем ошибки при повторной отправке
    except Exception as e:
        logger.error(f"Неизвестная ошибка при обработке команды /start от пользователя {message.from_user.id}: {e}", exc_info=True)
        try:
            await send_error_message(
                user_id=message.from_user.id,
                message=message,
                error_text="Произошла ошибка. Пожалуйста, попробуйте еще раз."
            )
        except:
            pass  # Игнорируем ошибки при отправке сообщения об ошибке
