from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# URL для WebApp
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-app-domain.com")

def get_webapp_keyboard(start_param=None):
    """
    Создает клавиатуру с кнопкой для открытия WebApp
    """
    # Формируем URL для WebApp с параметром startapp
    webapp_url = WEBAPP_URL
    if start_param:
        webapp_url = f"{WEBAPP_URL}?startapp={start_param}"
    else:
        webapp_url = f"{WEBAPP_URL}"
    
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📱 Открыть приложение",
                    web_app={"url": webapp_url}
                )
            ]
        ]
    )
    
    return keyboard