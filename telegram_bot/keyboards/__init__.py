from .webapp_knopka import get_webapp_keyboard
from .registration_keyboard import (
    get_start_no_referral_keyboard,
    get_start_with_referral_keyboard,
    get_invalid_code_keyboard,
    get_enter_code_keyboard,
)
from .main_menu import get_main_menu_keyboard
from .start_kb import (
    get_registration_keyboard,
    get_confirm_referral_keyboard,
    get_back_keyboard
)

__all__ = [
    "get_webapp_keyboard",
    "get_start_no_referral_keyboard",
    "get_start_with_referral_keyboard",
    "get_invalid_code_keyboard",
    "get_enter_code_keyboard",
    "get_main_menu_keyboard",
    "get_registration_keyboard",
    "get_confirm_referral_keyboard",
    "get_back_keyboard"
]