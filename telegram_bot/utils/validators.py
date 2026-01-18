import re
import logging

logger = logging.getLogger(__name__)

def is_valid_referral_code(code: str) -> bool:
    """
    Проверяет формат реферального кода
    Допустимый формат: 4 буквы + 4 цифры (например: ABCD1234)
    """
    if not code or not isinstance(code, str):
        return False
    
    pattern = r'^[A-Za-z]{4}\d{4}$'
    return bool(re.match(pattern, code.upper()))

def is_valid_telegram_id(telegram_id: int) -> bool:
    """
    Проверяет валидность Telegram ID
    Telegram ID должен быть положительным числом
    """
    if not isinstance(telegram_id, int):
        try:
            telegram_id = int(telegram_id)
        except (ValueError, TypeError):
            return False
    
    return telegram_id > 0

def sanitize_referral_code(code: str) -> str:
    """
    Очищает и форматирует реферальный код
    - Удаляет пробелы
    - Приводит к верхнему регистру
    - Ограничивает длину 8 символами
    """
    if not code:
        return ""
    
    sanitized = str(code).strip().upper()
    return sanitized[:8]

def sanitize_telegram_id(telegram_id) -> int:
    """
    Очищает и валидирует Telegram ID
    """
    try:
        if isinstance(telegram_id, str):
            telegram_id = telegram_id.strip()
        return int(telegram_id)
    except (ValueError, TypeError):
        return 0
