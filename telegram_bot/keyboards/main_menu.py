from aiogram.types import ReplyKeyboardMarkup, KeyboardButton
from telegram_bot.templates.emojis import EMOJI

def get_main_menu_keyboard() -> ReplyKeyboardMarkup:
    """
    Главное меню клавиатура после успешной регистрации
    """
    keyboard = [
        [
            KeyboardButton(text=f"{EMOJI['PROFILE']} Мой профиль"),
            KeyboardButton(text=f"{EMOJI['VPN']} VPN ключи")
        ],
        [
            KeyboardButton(text=f"{EMOJI['CHANNELS']} Мои каналы"),
            KeyboardButton(text=f"{EMOJI['BOTS']} Мои боты")
        ],
        [
            KeyboardButton(text=f"{EMOJI['PROMOTION']} Продвижение"),
            KeyboardButton(text=f"{EMOJI['REFERRAL_PROGRAM']} Реферальная программа")
        ],
        [
            KeyboardButton(text=f"{EMOJI['SUBSCRIPTION']} Подписка"),
            KeyboardButton(text=f"{EMOJI['SUPPORT']} Поддержка")
        ],
        [
            KeyboardButton(text=f"{EMOJI['SETTINGS']} Настройки"),
            KeyboardButton(text=f"{EMOJI['LOGOUT']} Выход")
        ]
    ]
    
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        one_time_keyboard=False
    )

def get_simple_menu_keyboard() -> ReplyKeyboardMarkup:
    """
    Упрощенная клавиатура для базовых действий
    """
    keyboard = [
        [KeyboardButton(text=f"{EMOJI['MENU']} Главное меню")]
    ]
    
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        one_time_keyboard=True
    )
