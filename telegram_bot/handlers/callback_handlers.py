from aiogram import Router
from aiogram.types import CallbackQuery
from aiogram.exceptions import TelegramNetworkError
import logging
import re

from ..database import database
from ..keyboards import get_webapp_keyboard
from ..utils.message_helpers import send_welcome_message, send_error_message, send_notification_to_referrer

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем роутер
callback_router = Router()

@callback_router.callback_query(lambda c: c.data.startswith('confirm_referral:'))
async def confirm_referral_handler(callback_query: CallbackQuery):
    """Обработчик подтверждения реферала"""
    try:
        user_id = callback_query.from_user.id
        user_full_name = callback_query.from_user.full_name
        username = callback_query.from_user.username

        logger.info(f"Пользователь {user_id} (@{username or 'N/A'}) подтвердил реферала")

        # Извлекаем реферальный код из callback_data
        referrer_code = callback_query.data.split(':', 1)[1] if ':' in callback_query.data else None

        if referrer_code:
            # Находим реферального пользователя по коду
            referrer = await database.get_user_by_referral_code(referrer_code)

            if referrer:
                # Проверяем, существует ли пользователь в базе данных
                existing_user = await database.get_user_by_telegram_id(user_id)

                if existing_user:
                    # Пользователь уже существует, просто обновляем информацию о реферале
                    # В Supabase через RPC функцию это может быть реализовано по-другому
                    # Для простоты, отправим сообщение пользователю
                    welcome_text = (
                        f"Отлично, {user_full_name}! 👍\n\n"
                        f"Вы уже были зарегистрированы, но подтвердили участие в реферальной программе и закреплены за пользователем {referrer['first_name']}.\n"
                        "Нажмите кнопку ниже, чтобы открыть приложение:"
                    )

                    await callback_query.message.edit_text(welcome_text)
                    await callback_query.message.answer("Добро пожаловать!", reply_markup=get_webapp_keyboard())

                    # Отправляем уведомление пригласителю
                    referrer_name = user_full_name.split()[0] if user_full_name.split() else user_full_name
                    await send_notification_to_referrer(referrer['telegram_id'], referrer_name, user_full_name)

                    # Отвечаем на callback
                    await callback_query.answer("Вы успешно подтвердили реферала!")
                    return
                else:
                    # Создаем пользователя с рефералом
                    user_data = await database.create_user(
                        telegram_id=user_id,
                        first_name=user_full_name.split()[0] if user_full_name.split() else user_full_name,
                        last_name=' '.join(user_full_name.split()[1:]) if len(user_full_name.split()) > 1 else None,
                        username=username,
                        referral_code=referrer_code,  # Передаем реферальный код
                        referred_by=referrer['id']
                    )

                    if user_data:
                        # Создаем запись о реферале
                        await database.create_referral_record(referrer['id'], user_data['id'], 1)

                        # Отправляем уведомление пригласителю
                        referrer_name = user_full_name.split()[0] if user_full_name.split() else user_full_name
                        await send_notification_to_referrer(referrer['telegram_id'], referrer_name, user_full_name)

                        # Отправляем сообщение пользователю
                        await send_welcome_message(
                            user_id=user_id,
                            full_name=user_full_name,
                            callback_query=callback_query,
                            keyboard=get_webapp_keyboard(),
                            referral_name=referrer['first_name']
                        )

                        # Отвечаем на callback
                        await callback_query.answer("Вы успешно подтвердили реферала!")
                        return
            else:
                logger.warning(f"Реферальный пользователь с кодом {referrer_code} не найден")

        # Если не удалось создать пользователя с рефералом, создаем без него
        # Проверяем сначала, не существует ли пользователь
        existing_user = await database.get_user_by_telegram_id(user_id)
        if not existing_user:
            user_data = await database.create_user(
                telegram_id=user_id,
                first_name=user_full_name.split()[0] if user_full_name.split() else user_full_name,
                last_name=' '.join(user_full_name.split()[1:]) if len(user_full_name.split()) > 1 else None,
                username=username,
                referral_code=None
            )
        else:
            user_data = existing_user

        if user_data:
            # Отправляем сообщение пользователю
            await send_welcome_message(
                user_id=user_id,
                full_name=user_full_name,
                callback_query=callback_query,
                keyboard=get_webapp_keyboard()
            )

            # Отвечаем на callback
            await callback_query.answer("Вы успешно зарегистрированы!")
        else:
            await send_error_message(
                user_id=user_id,
                callback_query=callback_query,
                error_text="Произошла ошибка при регистрации. Попробуйте еще раз."
            )

    except TelegramNetworkError as e:
        logger.error(f"Ошибка сети при обработке подтверждения реферала: {e}")
        await callback_query.answer("Произошла ошибка сети. Попробуйте еще раз.")
    except Exception as e:
        logger.error(f"Ошибка при обработке подтверждения реферала: {e}")
        await callback_query.answer("Произошла ошибка. Попробуйте еще раз.")

@callback_router.callback_query(lambda c: c.data == 'reject_referral')
async def reject_referral_handler(callback_query: CallbackQuery):
    """Обработчик отказа от реферала"""
    try:
        user_id = callback_query.from_user.id
        user_full_name = callback_query.from_user.full_name
        username = callback_query.from_user.username

        logger.info(f"Пользователь {user_id} (@{username or 'N/A'}) отказался от реферала")

        # Отправляем сообщение с предложением пройти по другой реферальной ссылке или продолжить
        reject_text = (
            f"{user_full_name}, вы отказались от реферала.\n\n"
            "Вы можете:\n"
            "1. Пройти по другой реферальной ссылке\n"
            "2. Продолжить и быть закрепленным за администратором бота"
        )

        # Создаем клавиатуру с кнопкой продолжения
        from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
        keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(text="➡️ Продолжить без реферала", callback_data="continue_without_referral"),
                ]
            ]
        )

        await callback_query.message.edit_text(reject_text)
        await callback_query.message.answer("Выберите действие:", reply_markup=keyboard)

        # Отвечаем на callback
        await callback_query.answer("Вы отказались от реферала.")

    except TelegramNetworkError as e:
        logger.error(f"Ошибка сети при обработке отказа от реферала: {e}")
        await callback_query.answer("Произошла ошибка сети. Попробуйте еще раз.")
    except Exception as e:
        logger.error(f"Ошибка при обработке отказа от реферала: {e}")
        await callback_query.answer("Произошла ошибка. Попробуйте еще раз.")

@callback_router.callback_query(lambda c: c.data == 'continue_without_referral')
async def continue_without_referral_handler(callback_query: CallbackQuery):
    """Обработчик продолжения без реферала"""
    try:
        user_id = callback_query.from_user.id
        user_full_name = callback_query.from_user.full_name
        username = callback_query.from_user.username

        logger.info(f"Пользователь {user_id} (@{username or 'N/A'}) выбрал продолжение без реферала")

        # Проверяем, существует ли пользователь в базе данных
        existing_user = await database.get_user_by_telegram_id(user_id)

        if existing_user:
            # Пользователь уже существует, просто отправляем ему веб-приложение
            await send_welcome_message(
                user_id=user_id,
                full_name=user_full_name,
                callback_query=callback_query,
                keyboard=get_webapp_keyboard()
            )

            # Отвечаем на callback
            await callback_query.answer("Вы уже зарегистрированы!")
        else:
            # Создаем пользователя без реферала (привязываем к админу или без привязки)
            user_data = await database.create_user(
                telegram_id=user_id,
                first_name=user_full_name.split()[0] if user_full_name.split() else user_full_name,
                last_name=' '.join(user_full_name.split()[1:]) if len(user_full_name.split()) > 1 else None,
                username=username,
                referral_code=None  # Будет сгенерирован автоматически
            )

            if user_data:
                await send_welcome_message(
                    user_id=user_id,
                    full_name=user_full_name,
                    callback_query=callback_query,
                    keyboard=get_webapp_keyboard()
                )

                # Отвечаем на callback
                await callback_query.answer("Вы успешно зарегистрированы!")
            else:
                await send_error_message(
                    user_id=user_id,
                    callback_query=callback_query,
                    error_text="Произошла ошибка при регистрации. Попробуйте еще раз."
                )

    except TelegramNetworkError as e:
        logger.error(f"Ошибка сети при обработке продолжения без реферала: {e}")
        await callback_query.answer("Произошла ошибка сети. Попробуйте еще раз.")
    except Exception as e:
        logger.error(f"Ошибка при обработке продолжения без реферала: {e}")
        await callback_query.answer("Произошла ошибка. Попробуйте еще раз.")