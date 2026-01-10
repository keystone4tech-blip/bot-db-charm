"""
Вспомогательные функции для работы с сообщениями в боте
"""
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup
import logging

logger = logging.getLogger(__name__)

async def send_welcome_message(
    user_id: int,
    full_name: str,
    message: Message = None,
    callback_query: CallbackQuery = None,
    keyboard: InlineKeyboardMarkup = None,
    referral_name: str = None
):
    """
    Отправляет приветственное сообщение пользователю
    
    Args:
        user_id: ID пользователя
        full_name: Полное имя пользователя
        message: Объект сообщения (если вызывается из хендлера сообщений)
        callback_query: Объект колбэка (если вызывается из хендлера колбэков)
        keyboard: Клавиатура для отправки
        referral_name: Имя реферала (если применимо)
    """
    if referral_name:
        welcome_text = (
            f"Отлично, {full_name}! 👍\n\n"
            f"Вы успешно подтвердили участие в реферальной программе и закреплены за пользователем {referral_name}.\n"
            "Нажмите кнопку ниже, чтобы открыть приложение:"
        )
    else:
        welcome_text = (
            f"Отлично, {full_name}! 👍\n\n"
            "Вы успешно зарегистрированы в системе.\n"
            "Нажмите кнопку ниже, чтобы открыть приложение:"
        )

    # Определяем, как отправить сообщение - как новое или как редактирование
    if callback_query:
        try:
            await callback_query.message.edit_text(welcome_text)
            if keyboard:
                await callback_query.message.answer("Добро пожаловать!", reply_markup=keyboard)
            await callback_query.answer("Успешно!")
        except Exception as e:
            logger.error(f"Ошибка при редактировании сообщения для пользователя {user_id}: {e}")
            # Если не удалось отредактировать, отправляем новое сообщение
            if message:
                await message.answer(welcome_text, reply_markup=keyboard)
    else:
        await message.answer(welcome_text, reply_markup=keyboard)


async def send_error_message(
    user_id: int,
    message: Message = None,
    callback_query: CallbackQuery = None,
    error_text: str = "Произошла ошибка. Пожалуйста, попробуйте еще раз."
):
    """
    Отправляет сообщение об ошибке пользователю
    
    Args:
        user_id: ID пользователя
        message: Объект сообщения (если вызывается из хендлера сообщений)
        callback_query: Объект колбэка (если вызывается из хендлера колбэков)
        error_text: Текст ошибки для отправки
    """
    try:
        if callback_query:
            await callback_query.message.answer(error_text)
            await callback_query.answer("Ошибка")
        else:
            await message.answer(error_text)
    except Exception as e:
        logger.error(f"Ошибка при отправке сообщения об ошибке пользователю {user_id}: {e}")


async def send_notification_to_referrer(
    referrer_id: str,
    referrer_name: str,
    referrer_full_name: str
):
    """
    Отправляет уведомление пригласителю о новом реферале
    
    Args:
        referrer_id: ID пригласителя
        referrer_name: Имя пригласителя
        referrer_full_name: Полное имя нового реферала
    """
    from ..bot_instance import bot as telegram_bot
    try:
        notification_text = (
            f"🎉 У вас новый реферал!\n\n"
            f"Пользователь {referrer_name} присоединился по вашей ссылке и подтвердил участие в реферальной программе."
        )
        await telegram_bot.send_message(referrer_id, notification_text)
    except Exception as e:
        logger.error(f"Ошибка при отправке уведомления пригласителю {referrer_id}: {e}")