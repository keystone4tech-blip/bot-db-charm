from aiogram.dispatcher.filters.state import State, StatesGroup

class RegistrationStates(StatesGroup):
    waiting_for_action = State()
    waiting_for_referral_code = State()

class ProfileEditStates(StatesGroup):
    waiting_for_name = State()
    waiting_for_confirmation = State()

class SupportStates(StatesGroup):
    waiting_for_title = State()
    waiting_for_description = State()
    waiting_for_confirmation = State()
