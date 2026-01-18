"""Improved /start command handler with FSM and referral system"""
from aiogram import Router, types
from aiogram.filters import CommandStart
from aiogram.dispatcher.fsm.context import FSMContext
from aiogram.exceptions import TelegramNetworkError
from dotenv import load_dotenv
import logging
import os

from ..database import database
from ..states import RegistrationStates
from ..keyboards import (
    get_webapp_keyboard,
    get_start_no_referral_keyboard,
    get_start_with_referral_keyboard,
    get_invalid_code_keyboard,
    get_enter_code_keyboard,
    get_main_menu_keyboard
)
from ..bot_instance import bot as telegram_bot

# Load environment variables
load_dotenv()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
start_router = Router()

# Message texts
MESSAGE_NO_REFERRAL = """👋 <b>Добро пожаловать!</b>

Я заметил, что вы присоединились <b>без реферальной ссылки</b>.

🤔 <b>Что это означает?</b>
Это значит, что вы будете привязаны к нашему администратору.

🎁 <b>Но у вас есть выбор!</b>
Если у вас есть:
  • Реферальная ссылка от друга 👥
  • Реферальный код приглашающего 📝

Вы можете присоединиться к ним!

⏰ <b>Как это сделать?</b>
1️⃣ Отправьте мне реферальный код
2️⃣ Или перейдите по реф. ссылке друга заново

✨ Если у вас нет реф. кода:
Нажмите кнопку ниже!
"""

MESSAGE_REFERRAL_FOUND = """👋 <b>Добро пожаловать!</b>

🎉 <b>Отлично! Вас пригласил:</b>

👤 <b>{name}</b> (@{username})
📊 Рефералов: {referrals_count}

✨ <b>Что вы получите?</b>
Присоединившись к {name}, вы сможете:
  • Участвовать в реферальной программе
  • Получать награды и бонусы
  • Расширить свою сеть контактов

🤝 <b>Вы доверяете этому пригласителю?</b>
Если да - просто подтвердите!
"""

MESSAGE_REGISTRATION_SUCCESS = """✅ <b>Поздравляем!</b>

Вы успешно зарегистрированы! 🎉

👤 <b>Ваш пригласиющий:</b> {referrer_name}
🔐 <b>Ваш реф. код:</b> <code>{referral_code}</code>
📅 <b>Дата присоединения:</b> {date}

🎁 <b>Что дальше?</b>
Вы можете:
  ✅ Приглашать друзей по своей ссылке
  📊 Отслеживать своих рефералов
  💰 Получать награды

🔗 <b>Ваша реф. ссылка:</b>
<code>https://t.me/{bot_username}?start={referral_code}</code>
"""

MESSAGE_INVALID_CODE = """❌ <b>К сожалению, этот код не работает</b>

<b>Возможные причины:</b>
  ❌ Код введен неправильно
  ❌ Код больше не активен
  ⚠️ Это может быть ваш собственный код

💡 <b>Что делать?</b>
  1️⃣ Проверьте код и попробуйте еще раз
  2️⃣ Попросите реф. ссылку у пригласителя
  3️⃣ Присоединитесь к администратору
"""

MESSAGE_EXISTING_USER = """👋 Привет снова, {name}!

Я помню вас! 😊
Вы уже зарегистрированы в нашей системе.

👤 <b>Ваш пригласиющий:</b> {referrer_name}
📅 <b>Присоединились:</b> {join_date}

👇 <b>Главное меню:</b>
"""

MESSAGE_ENTER_CODE = """📝 <b>Отправьте реферальный код</b>

Введите код, который вы получили от пригласителя.

Пример: <code>ABC123XYZ</code>

⚠️ <i>Код должен быть от другого пользователя, не от вас.</i>
"""


def format_user_name(first_name: str, last_name: str = None, username: str = None) -> str:
    """Format user's display name"""
    if first_name and last_name:
        return f"{first_name} {last_name}".strip()
    elif first_name:
        return first_name
    elif username:
        return f"@{username}"
    else:
        return "Пользователь"


def format_referrer_name(referrer_info: dict) -> str:
    """Format referrer's name for display"""
    if not referrer_info:
        return "Administrator"
    
    name = format_user_name(
        referrer_info.get('first_name'),
        referrer_info.get('last_name'),
        referrer_info.get('telegram_username') or referrer_info.get('username')
    )
    return name


def format_date(date_string: str) -> str:
    """Format date for display"""
    if not date_string:
        return "сегодня"
    
    try:
        # Handle both ISO format and other formats
        if 'T' in date_string:
            return date_string.split('T')[0]
        return date_string.split()[0]
    except:
        return date_string


@start_router.message(CommandStart())
async def cmd_start(message: types.Message, state: FSMContext) -> None:
    """Handler for /start command with improved referral flow"""
    try:
        user_id = message.from_user.id
        first_name = message.from_user.first_name or "User"
        username = message.from_user.username or None
        
        # Get referral parameter from command
        args = message.text.split(maxsplit=1)
        referral_code = args[1].strip() if len(args) > 1 else None
        
        logger.info(f"User {user_id} (@{username or 'N/A'}) started with referral_code: {referral_code}")
        
        # Clean up any previous state
        await state.clear()
        
        # Check if user already exists
        existing_user = await database.get_user_by_telegram_id(user_id)
        
        if existing_user:
            # User already registered
            logger.info(f"User {user_id} already exists in database")
            
            referrer_name = "Администратор"
            if existing_user.get('referred_by'):
                # Try to get referrer info
                try:
                    from ..db_api_client import db_api_client
                    referrer = db_api_client.select("profiles", where={"id": existing_user['referred_by']})
                    if referrer and len(referrer) > 0:
                        referrer_name = format_user_name(
                            referrer[0].get('first_name'),
                            referrer[0].get('last_name'),
                            referrer[0].get('telegram_username')
                        )
                except Exception as e:
                    logger.error(f"Error getting referrer info: {e}")
            
            welcome_text = MESSAGE_EXISTING_USER.format(
                name=first_name,
                referrer_name=referrer_name,
                join_date=format_date(str(existing_user.get('created_at', '')))
            )
            
            await message.answer(welcome_text, parse_mode="HTML", reply_markup=get_main_menu_keyboard())
            logger.info(f"Sent welcome message to existing user {user_id}")
            return
        
        # New user registration flow
        referrer_info = None
        
        if referral_code:
            # User came with referral code - verify it
            logger.info(f"Verifying referral code: {referral_code}")
            try:
                # Try to get referrer info through DB API or direct DB
                if hasattr(database, 'db_api_client'):
                    referrer_data = database.db_api_client.select("profiles", where={"referral_code": referral_code.upper()})
                    if referrer_data and len(referrer_data) > 0:
                        referrer = referrer_data[0]
                        # Don't allow using own code
                        if referrer.get('telegram_id') != user_id:
                            referrer_info = {
                                'id': referrer.get('id'),
                                'first_name': referrer.get('first_name'),
                                'last_name': referrer.get('last_name'),
                                'telegram_username': referrer.get('telegram_username'),
                                'referrals_count': 0
                            }
                            logger.info(f"Found referrer: {referrer_info['first_name']}")
            except Exception as e:
                logger.error(f"Error verifying referral code: {e}")
        
        # Store registration data in state
        async with state.proxy() as data:
            data['telegram_id'] = user_id
            data['first_name'] = first_name
            data['last_name'] = message.from_user.last_name or None
            data['username'] = username
            data['referrer_info'] = referrer_info
            data['referral_code'] = referral_code
        
        # Show appropriate message based on whether referrer was found
        if referrer_info:
            # Show MESSAGE 2 - Referral found
            referrer_name = format_user_name(
                referrer_info.get('first_name'),
                referrer_info.get('last_name'),
                referrer_info.get('telegram_username')
            )
            
            welcome_text = MESSAGE_REFERRAL_FOUND.format(
                name=referrer_name,
                username=referrer_info.get('telegram_username', 'unknown'),
                referrals_count=referrer_info.get('referrals_count', 0)
            )
            
            await message.answer(welcome_text, parse_mode="HTML", reply_markup=get_start_with_referral_keyboard(referrer_name))
            await state.set_state(RegistrationStates.waiting_for_action)
            logger.info(f"Sent referral found message to user {user_id}")
        else:
            # Show MESSAGE 1 - No referral
            await message.answer(MESSAGE_NO_REFERRAL, parse_mode="HTML", reply_markup=get_start_no_referral_keyboard())
            await state.set_state(RegistrationStates.waiting_for_action)
            logger.info(f"Sent no referral message to user {user_id}")
    
    except TelegramNetworkError as e:
        logger.error(f"Network error in /start for user {message.from_user.id}: {e}")
        try:
            await message.answer("Привет! Нажмите /start еще раз, если не получили сообщение.")
        except:
            pass
    except Exception as e:
        logger.error(f"Error in /start handler: {e}", exc_info=True)
        try:
            await message.answer("Произошла ошибка. Попробуйте позже.")
        except:
            pass


@start_router.callback_query(lambda c: c.data and c.data.startswith('reg:'), state=RegistrationStates.waiting_for_action)
async def process_registration_callback(callback: types.CallbackQuery, state: FSMContext):
    """Process registration callback buttons"""
    try:
        action = callback.data
        user_id = callback.from_user.id
        user_full_name = callback.from_user.full_name or "User"
        
        logger.info(f"User {user_id} pressed callback: {action}")
        
        async with state.proxy() as data:
            user_data = dict(data)
        
        # Handle different actions
        if action == 'reg:confirm:admin':
            # User chose to continue with admin (no referral)
            await handle_confirmation(callback, state, referrer_info=None, is_admin=True)
            
        elif action == 'reg:confirm:referral':
            # User confirmed the found referral
            referrer_info = user_data.get('referrer_info')
            if referrer_info:
                await handle_confirmation(callback, state, referrer_info=referrer_info, is_admin=False)
            else:
                # Fallback to admin if no referrer
                await handle_confirmation(callback, state, referrer_info=None, is_admin=True)
                
        elif action == 'reg:enter:code':
            # User wants to enter a referral code
            await callback.message.edit_text(
                MESSAGE_ENTER_CODE,
                parse_mode="HTML",
                reply_markup=get_enter_code_keyboard()
            )
            await state.set_state(RegistrationStates.waiting_for_referral_code)
            await callback.answer()
            
    except TelegramNetworkError as e:
        logger.error(f"Network error in callback: {e}")
        await callback.answer("Ошибка сети. Попробуйте еще раз.", show_alert=True)
    except Exception as e:
        logger.error(f"Error in callback handler: {e}", exc_info=True)
        await callback.answer("Произошла ошибка. Попробуйте позже.", show_alert=True)


async def handle_confirmation(callback: types.CallbackQuery, state: FSMContext, referrer_info: dict = None, is_admin: bool = False):
    """Handle user confirmation and create profile"""
    try:
        user_id = callback.from_user.id
        user_full_name = callback.from_user.full_name or "User"
        
        async with state.proxy() as data:
            telegram_id = data.get('telegram_id', user_id)
            first_name = data.get('first_name', user_full_name.split()[0] if user_full_name.split() else user_full_name)
            last_name = data.get('last_name', None)
            username = data.get('username', callback.from_user.username)
        
        logger.info(f"Creating profile for user {user_id} with referrer: {referrer_info}")
        
        # Determine referred_by
        referred_by = None
        if not is_admin and referrer_info:
            referred_by = referrer_info.get('id')
        
        # Create user in database
        user_data = await database.create_user(
            telegram_id=telegram_id,
            first_name=first_name,
            last_name=last_name,
            username=username,
            referral_code=None,  # Will be auto-generated
            referred_by=referred_by
        )
        
        if user_data:
            # Get bot info for referral link
            bot_info = await telegram_bot.get_me()
            
            referrer_name = "Administrator"
            if referrer_info:
                referrer_name = format_user_name(
                    referrer_info.get('first_name'),
                    referrer_info.get('last_name'),
                    referrer_info.get('telegram_username')
                )
            
            # Format created_at date
            created_at = user_data.get('created_at', '') if user_data else ''
            if created_at:
                if 'T' in created_at:
                    created_at = created_at.split('T')[0]
            
            # Send success message
            success_text = MESSAGE_REGISTRATION_SUCCESS.format(
                referrer_name=referrer_name,
                referral_code=user_data.get('referral_code', 'N/A'),
                date=created_at or "сегодня",
                bot_username=bot_info.username
            )
            
            await callback.message.edit_text(success_text, parse_mode="HTML")
            await callback.message.answer(
                "👇 <b>Главное меню:</b>",
                reply_markup=get_main_menu_keyboard(),
                parse_mode="HTML"
            )
            
            # Send notification to referrer if exists
            if referrer_info and not is_admin:
                try:
                    referrer_telegram_id = referrer_info.get('telegram_id')
                    if referrer_telegram_id:
                        notification = (
                            f"🎉 <b>У вас новый реферал!</b>\n\n"
                            f"Пользователь {first_name} присоединился по вашей ссылке."
                        )
                        await telegram_bot.send_message(referrer_telegram_id, notification, parse_mode="HTML")
                except Exception as e:
                    logger.error(f"Error sending notification to referrer: {e}")
            
            logger.info(f"Successfully registered user {user_id}")
            await callback.answer()
            await state.finish()
        else:
            await callback.message.edit_text("❌ Ошибка при регистрации. Попробуйте позже.")
            await callback.answer("Ошибка регистрации", show_alert=True)
            
    except Exception as e:
        logger.error(f"Error in handle_confirmation: {e}", exc_info=True)
        await callback.message.edit_text("❌ Произошла ошибка. Попробуйте позже.")
        await callback.answer()


@start_router.message(state=RegistrationStates.waiting_for_referral_code)
async def process_referral_code_input(message: types.Message, state: FSMContext):
    """Process user's referral code input"""
    try:
        user_id = message.from_user.id
        first_name = message.from_user.first_name or "User"
        username = message.from_user.username or None
        
        # Get and clean the referral code
        referral_code = message.text.strip().upper()
        
        logger.info(f"User {user_id} entered referral code: {referral_code}")
        
        if not referral_code or len(referral_code) < 3:
            await message.answer(
                "❌ <b>Код слишком короткий</b>\n\n"
                "Пожалуйста, введите корректный реферальный код (минимум 3 символа).",
                parse_mode="HTML",
                reply_markup=get_invalid_code_keyboard()
            )
            return
        
        # Verify the code
        referrer_info = None
        try:
            # Try to find referrer by code
            if hasattr(database, 'db_api_client'):
                referrer_data = database.db_api_client.select("profiles", where={"referral_code": referral_code})
                if referrer_data and len(referrer_data) > 0:
                    referrer = referrer_data[0]
                    # Check if user is trying to use their own code
                    if referrer.get('telegram_id') == user_id:
                        await message.answer(
                            "❌ <b>Нельзя использовать свой код</b>\n\n"
                            "Вы не можете быть рефералом сами себя!",
                            parse_mode="HTML",
                            reply_markup=get_invalid_code_keyboard()
                        )
                        return
                    
                    referrer_info = {
                        'id': referrer.get('id'),
                        'first_name': referrer.get('first_name'),
                        'last_name': referrer.get('last_name'),
                        'telegram_username': referrer.get('telegram_username'),
                        'referrals_count': 0,
                        'telegram_id': referrer.get('telegram_id')
                    }
        except Exception as e:
            logger.error(f"Error verifying referral code: {e}")
        
        if referrer_info:
            # Valid referral found - show confirmation
            referrer_name = format_user_name(
                referrer_info.get('first_name'),
                referrer_info.get('last_name'),
                referrer_info.get('telegram_username')
            )
            
            welcome_text = MESSAGE_REFERRAL_FOUND.format(
                name=referrer_name,
                username=referrer_info.get('telegram_username', 'unknown'),
                referrals_count=referrer_info.get('referrals_count', 0)
            )
            
            await message.answer(welcome_text, parse_mode="HTML", reply_markup=get_start_with_referral_keyboard(referrer_name))
            
            # Update state with new referrer info
            async with state.proxy() as data:
                data['referrer_info'] = referrer_info
                data['referral_code'] = referral_code
            
            await state.set_state(RegistrationStates.waiting_for_action)
            logger.info(f"Valid referral code entered for user {user_id}")
        else:
            # Invalid code - show error
            await message.answer(MESSAGE_INVALID_CODE, parse_mode="HTML", reply_markup=get_invalid_code_keyboard())
            logger.info(f"Invalid referral code entered by user {user_id}")
            
    except TelegramNetworkError as e:
        logger.error(f"Network error processing referral code: {e}")
        await message.answer("Ошибка сети. Попробуйте еще раз.")
    except Exception as e:
        logger.error(f"Error processing referral code: {e}", exc_info=True)
        await message.answer("Произошла ошибка. Попробуйте позже.")


@start_router.callback_query(lambda c: c.data == 'reg:enter:cancel', state=RegistrationStates.waiting_for_referral_code)
async def cancel_code_input(callback: types.CallbackQuery, state: FSMContext):
    """Cancel referral code input and show main menu"""
    try:
        user_id = callback.from_user.id
        first_name = callback.from_user.first_name or "User"
        
        # Clear state and show no referral message
        await state.clear()
        
        await callback.message.edit_text(
            "👇 <b>Выберите действие:</b>",
            parse_mode="HTML"
        )
        await callback.message.answer(
            MESSAGE_NO_REFERRAL,
            parse_mode="HTML",
            reply_markup=get_start_no_referral_keyboard()
        )
        
        await state.set_state(RegistrationStates.waiting_for_action)
        await callback.answer()
        
    except Exception as e:
        logger.error(f"Error canceling code input: {e}")
        await callback.answer()
