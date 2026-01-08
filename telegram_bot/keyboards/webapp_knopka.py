from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# URL для WebApp
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://bot-db-charm.lovable.app/")


def get_webapp_keyboard(start_param: str | None = None) -> InlineKeyboardMarkup:
    """Создает клавиатуру с кнопкой для открытия WebApp."""
    # Формируем URL для WebApp с параметром startapp
    webapp_url = WEBAPP_URL
    if start_param:
        webapp_url = f"{WEBAPP_URL}?startapp={start_param}"

    # Проверяем, что URL начинается с https://
    if not webapp_url.startswith(('http://', 'https://')):
        webapp_url = f"https://{webapp_url.lstrip('https://').lstrip('http://')}"

    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📱 Открыть приложение",
                    web_app=WebAppInfo(url=webapp_url),
                )
            ]
        ]
    )
