import logging
from aiogram import Router, types
from aiogram.filters import Command
from telegram_bot.services.api_client import api_client

logger = logging.getLogger(__name__)

otp_router = Router()

@otp_router.message(Command("send_otp"))
async def send_otp_command(message: types.Message):
    """
    Обработчик команды /send_otp для отправки одноразового пароля на сайт
    """
    user_id = message.from_user.id
    
    try:
        # Получаем информацию о пользователе через API
        user_info = await api_client.get_user(user_id)
        
        if not user_info or not user_info.get('email'):
            await message.answer(
                "❌ Для использования этой функции необходимо сначала зарегистрироваться на сайте и привязать ваш email.\n"
                "После регистрации на сайте вы можете привязать ваш Telegram аккаунт."
            )
            return
        
        email = user_info.get('email')
        
        # Отправляем запрос на сервер для генерации и отправки OTP
        import aiohttp
        import os
        from dotenv import load_dotenv
        load_dotenv()
        
        base_url = os.getenv("API_BASE_URL", "http://localhost:3000")
        
        async with aiohttp.ClientSession() as session:
            payload = {'email': email}
            
            async with session.post(
                f"{base_url}/api/email/send-otp",
                json=payload
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    if result.get('success'):
                        await message.answer(
                            f"✅ Одноразовый пароль отправлен на ваш email: {email}\n"
                            f"Пароль действителен 10 минут. Используйте его для входа на сайт."
                        )
                    else:
                        error_msg = result.get('error', 'Неизвестная ошибка')
                        await message.answer(f"❌ Ошибка при отправке OTP: {error_msg}")
                else:
                    error_text = await response.text()
                    logger.error(f"Error sending OTP: {response.status}, {error_text}")
                    await message.answer("❌ Ошибка при отправке одноразового пароля. Попробуйте позже.")
                    
    except Exception as e:
        logger.error(f"Error in send_otp command: {e}")
        await message.answer("❌ Произошла ошибка при отправке одноразового пароля. Попробуйте позже.")


@otp_router.message(Command("link_account"))
async def link_account_command(message: types.Message):
    """
    Обработчик команды /link_account для привязки Telegram аккаунта к email аккаунту
    """
    user_id = message.from_user.id
    
    try:
        # Сначала проверяем, есть ли у пользователя email аккаунт
        user_info = await api_client.get_user(user_id)
        
        if user_info and user_info.get('email'):
            await message.answer(
                "❌ Ваш Telegram аккаунт уже привязан к email аккаунту."
            )
            return
        
        await message.answer(
            "🔗 Чтобы привязать ваш Telegram аккаунт к существующему email аккаунту:\n\n"
            "1. Войдите в ваш аккаунт на сайте\n"
            "2. Перейдите в раздел настроек\n"
            "3. Найдите раздел 'Привязать Telegram'\n"
            "4. Следуйте инструкциям на сайте\n\n"
            "Альтернативно, вы можете использовать команду /send_otp для получения одноразового пароля для входа на сайт."
        )
        
    except Exception as e:
        logger.error(f"Error in link_account command: {e}")
        await message.answer("❌ Произошла ошибка. Попробуйте позже.")