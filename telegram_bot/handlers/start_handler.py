import logging
from typing import Dict, Any, Optional
from aiogram import Router, types, F
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery
import re

from telegram_bot.states import RegistrationStates
from telegram_bot.services.api_client import api_client
from telegram_bot.keyboards.start_kb import (
    get_registration_keyboard,
    get_confirm_referral_keyboard,
    get_back_keyboard
)
from telegram_bot.keyboards.main_menu import get_main_menu_keyboard
from telegram_bot.templates.messages import (
    MESSAGE_NO_REFERRAL,
    MESSAGE_REFERRAL_FOUND,
    MESSAGE_REGISTRATION_SUCCESS,
    MESSAGE_INVALID_CODE,
    MESSAGE_ENTER_REFERRAL_CODE,
    MESSAGE_WELCOME_BACK
)
from telegram_bot.utils.validators import sanitize_referral_code
from telegram_bot.config import ADMIN_IDS

logger = logging.getLogger(__name__)

start_router = Router()

@start_router.message(CommandStart())
async def command_start_handler(message: Message, state: FSMContext):
    """
    Обработчик команды /start с поддержкой реферальной системы
    """
    try:
        # Parse referral code from command arguments
        args = message.text.split()
        referral_code = None
        
        if len(args) > 1:
            referral_code = sanitize_referral_code(args[1])
            logger.info(f"User {message.from_user.id} started with referral code: {referral_code}")
        
        # Register user via API
        result = await api_client.register_user(
            telegram_id=message.from_user.id,
            first_name=message.from_user.first_name,
            username=message.from_user.username,
            referral_code=referral_code
        )
        
        if not result:
            await message.answer("❌ Ошибка регистрации. Попробуйте позже.")
            return
        
        # Store result in state for later use
        await state.update_data(registration_result=result, referral_code=referral_code)
        
        # Check if user is existing
        is_existing = result.get('is_existing', False)
        profile = result.get('profile', {})
        referrer_info = result.get('referrer_info')
        
        if is_existing:
            # Welcome back user
            welcome_text = MESSAGE_WELCOME_BACK.format(first_name=profile.get('first_name', 'User'))
            await message.answer(welcome_text, reply_markup=get_main_menu_keyboard())
            await state.clear()
            return
        
        # New user - handle referral flow
        if referrer_info:
            # Referral code was valid
            referrer_name = referrer_info.get('first_name', 'Unknown')
            await state.set_state(RegistrationStates.waiting_for_action)
            
            text = MESSAGE_REFERRAL_FOUND.format(referrer_name=referrer_name)
            await message.answer(text, reply_markup=get_confirm_referral_keyboard())
        elif referral_code:
            # Code was provided but invalid
            await state.set_state(RegistrationStates.waiting_for_action)
            
            text = MESSAGE_INVALID_CODE.format(code=referral_code)
            await message.answer(text, reply_markup=get_registration_keyboard())
        else:
            # No referral code provided
            await state.set_state(RegistrationStates.waiting_for_action)
            await message.answer(MESSAGE_NO_REFERRAL, reply_markup=get_registration_keyboard())
            
    except Exception as e:
        logger.error(f"Error in start handler: {e}")
        await message.answer("❌ Произошла ошибка. Попробуйте позже.")

@start_router.callback_query(F.data == "confirm:admin")
async def confirm_admin_callback(callback: CallbackQuery, state: FSMContext):
    """
    Обработчик подтверждения регистрации как администратор
    """
    try:
        data = await state.get_data()
        result = data.get('registration_result')
        
        if not result:
            await callback.answer("❌ Ошибка данных. Попробуйте снова.", show_alert=True)
            return
        
        profile = result.get('profile', {})
        first_name = profile.get('first_name', 'User')
        
        success_text = MESSAGE_REGISTRATION_SUCCESS.format(first_name=first_name)
        await callback.message.answer(success_text, reply_markup=get_main_menu_keyboard())
        await callback.answer("✅ Регистрация успешна!")
        await state.clear()
        
    except Exception as e:
        logger.error(f"Error in confirm admin callback: {e}")
        await callback.answer("❌ Ошибка. Попробуйте позже.", show_alert=True)

@start_router.callback_query(F.data == "confirm:referral")
async def confirm_referral_callback(callback: CallbackQuery, state: FSMContext):
    """
    Обработчик подтверждения регистрации с текущим реферером
    """
    try:
        data = await state.get_data()
        result = data.get('registration_result')
        
        if not result:
            await callback.answer("❌ Ошибка данных. Попробуйте снова.", show_alert=True)
            return
        
        profile = result.get('profile', {})
        first_name = profile.get('first_name', 'User')
        
        success_text = MESSAGE_REGISTRATION_SUCCESS.format(first_name=first_name)
        await callback.message.answer(success_text, reply_markup=get_main_menu_keyboard())
        await callback.answer("✅ Регистрация успешна!")
        await state.clear()
        
    except Exception as e:
        logger.error(f"Error in confirm referral callback: {e}")
        await callback.answer("❌ Ошибка. Попробуйте позже.", show_alert=True)

@start_router.callback_query(F.data == "enter:code")
async def enter_code_callback(callback: CallbackQuery, state: FSMContext):
    """
    Обработчик запроса ввода реферального кода
    """
    try:
        await state.set_state(RegistrationStates.waiting_for_referral_code)
        await callback.message.answer(MESSAGE_ENTER_REFERRAL_CODE)
        await callback.answer()
    except Exception as e:
        logger.error(f"Error in enter code callback: {e}")
        await callback.answer("❌ Ошибка. Попробуйте позже.", show_alert=True)

@start_router.callback_query(F.data == "back:start")
async def back_to_start_callback(callback: CallbackQuery, state: FSMContext):
    """
    Обработчик возврата к началу регистрации
    """
    try:
        data = await state.get_data()
        referral_code = data.get('referral_code')
        
        await state.set_state(RegistrationStates.waiting_for_action)
        
        if referral_code:
            text = MESSAGE_INVALID_CODE.format(code=referral_code)
        else:
            text = MESSAGE_NO_REFERRAL
        
        await callback.message.answer(text, reply_markup=get_registration_keyboard())
        await callback.answer()
        
    except Exception as e:
        logger.error(f"Error in back to start callback: {e}")
        await callback.answer("❌ Ошибка. Попробуйте позже.", show_alert=True)

@start_router.message(RegistrationStates.waiting_for_referral_code)
async def handle_referral_code_input(message: Message, state: FSMContext):
    """
    Обработчик ввода реферального кода
    """
    try:
        code = sanitize_referral_code(message.text)
        
        # Verify code via API
        result = await api_client.verify_referral_code(code)
        
        if result and result.get('valid'):
            # Code is valid - re-register user with new code
            reg_result = await api_client.register_user(
                telegram_id=message.from_user.id,
                first_name=message.from_user.first_name,
                username=message.from_user.username,
                referral_code=code
            )
            
            if reg_result:
                referrer_info = result.get('user', {})
                referrer_name = referrer_info.get('first_name', 'Unknown')
                
                await state.update_data(registration_result=reg_result, referral_code=code)
                await state.set_state(RegistrationStates.waiting_for_action)
                
                text = MESSAGE_REFERRAL_FOUND.format(referrer_name=referrer_name)
                await message.answer(text, reply_markup=get_confirm_referral_keyboard())
            else:
                await message.answer("❌ Ошибка регистрации. Попробуйте позже.", reply_markup=get_back_keyboard())
        else:
            # Invalid code
            await state.set_state(RegistrationStates.waiting_for_action)
            await message.answer(
                MESSAGE_INVALID_CODE.format(code=code),
                reply_markup=get_registration_keyboard()
            )
            
    except Exception as e:
        logger.error(f"Error handling referral code input: {e}")
        await message.answer("❌ Ошибка обработки кода. Попробуйте позже.")