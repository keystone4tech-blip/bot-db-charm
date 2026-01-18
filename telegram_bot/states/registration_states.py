"""FSM states for registration flow"""
from aiogram.dispatcher.filters.state import State, StatesGroup


class RegistrationStates(StatesGroup):
    """States for the registration process"""
    waiting_for_action = State()      # Waiting for user to choose between confirming and entering code
    waiting_for_referral_code = State()  # Waiting for user to input referral code
