from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from telegram_bot.templates.emojis import EMOJI

def get_registration_keyboard() -> InlineKeyboardMarkup:
    """
    Клавиатура для выбора способа регистрации
    """
    keyboard = [
        [
            InlineKeyboardButton(
                text=f"{EMOJI['ADMIN']} Зарегистрироваться как админ",
                callback_data="confirm:admin"
            )
        ],
        [
            InlineKeyboardButton(
                text=f"{EMOJI['REFERRAL']} Ввести реферальный код",
                callback_data="enter:code"
            )
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_confirm_referral_keyboard() -> InlineKeyboardMarkup:
    """
    Клавиатура для подтверждения реферального кода
    """
    keyboard = [
        [
            InlineKeyboardButton(
                text=f"{EMOJI['CHECK']} Подтвердить регистрацию",
                callback_data="confirm:referral"
            )
        ],
        [
            InlineKeyboardButton(
                text=f"{EMOJI['REFERRAL']} Ввести другой код",
                callback_data="enter:code"
            )
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_back_keyboard() -> InlineKeyboardMarkup:
    """
    Клавиатура для возврата к выбору действия
    """
    keyboard = [
        [
            InlineKeyboardButton(
                text=f"{EMOJI['BACK']} Вернуться назад",
                callback_data="back:start"
            )
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)
