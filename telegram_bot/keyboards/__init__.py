from .webapp_knopka import get_webapp_keyboard
from .registration_keyboard import (
    get_start_no_referral_keyboard,
    get_start_with_referral_keyboard,
    get_invalid_code_keyboard,
    get_enter_code_keyboard,
    get_main_menu_keyboard
)

__all__ = [
    "get_webapp_keyboard",
    "get_start_no_referral_keyboard",
    "get_start_with_referral_keyboard",
    "get_invalid_code_keyboard",
    "get_enter_code_keyboard",
    "get_main_menu_keyboard"
]