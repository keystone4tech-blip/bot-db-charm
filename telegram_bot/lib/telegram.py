"""
Вспомогательные функции для работы с Telegram WebApp
"""

import os
from urllib.parse import urlparse, parse_qs

def get_referral_code_from_url():
    """
    Получает реферальный код из URL параметров
    """
    # В контексте бота, мы не имеем прямого доступа к URL
    # Эта функция будет использоваться в веб-приложении
    # Возвращаем None, так как в боте реферальный код передается через start_param
    return None

def get_referral_code_from_start_param(start_param: str = None):
    """
    Получает реферальный код из параметра start_param команды /start
    """
    if start_param:
        return start_param
    return None

def get_referral_code(start_param: str = None):
    """
    Получает реферальный код из всех возможных источников
    """
    # В контексте бота, основным источником является start_param
    referral_code = get_referral_code_from_start_param(start_param)
    
    return referral_code