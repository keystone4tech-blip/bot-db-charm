"""Keyboards for registration flow"""
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
import logging

logger = logging.getLogger(__name__)


def get_start_no_referral_keyboard():
    """Keyboard for users without referral - MESSAGE 1"""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅ Присоединиться к админу",
                    callback_data="reg:confirm:admin"
                )
            ],
            [
                InlineKeyboardButton(
                    text="📝 Ввести реф. код",
                    callback_data="reg:enter:code"
                )
            ]
        ]
    )
    return keyboard


def get_start_with_referral_keyboard(referrer_name: str, referrals_count: int = 0):
    """Keyboard for users with found referral - MESSAGE 2"""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅ Да, я подтверждаю",
                    callback_data="reg:confirm:referral"
                )
            ],
            [
                InlineKeyboardButton(
                    text="📝 Ввести другой код",
                    callback_data="reg:enter:code"
                )
            ],
            [
                InlineKeyboardButton(
                    text="❌ Присоединиться к админу",
                    callback_data="reg:confirm:admin"
                )
            ]
        ]
    )
    return keyboard


def get_invalid_code_keyboard():
    """Keyboard for invalid referral code - MESSAGE 4"""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🔄 Попробовать еще раз",
                    callback_data="reg:enter:code"
                )
            ],
            [
                InlineKeyboardButton(
                    text="✅ Продолжить с админом",
                    callback_data="reg:confirm:admin"
                )
            ]
        ]
    )
    return keyboard


def get_enter_code_keyboard():
    """Keyboard to cancel entering code"""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="❌ Отмена",
                    callback_data="reg:enter:cancel"
                )
            ]
        ]
    )
    return keyboard


def get_main_menu_keyboard():
    """Main menu keyboard with WebApp button"""
    from .webapp_knopka import get_webapp_keyboard
    return get_webapp_keyboard()
