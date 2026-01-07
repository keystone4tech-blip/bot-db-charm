import aiohttp
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class ApiClient:
    """
    Клиент для взаимодействия с Node.js сервером API
    """
    
    def __init__(self):
        self.base_url = os.getenv("API_BASE_URL", "http://localhost:3000")
        self.bot_token = os.getenv("TELEGRAM_BOT_TOKEN") or os.getenv("BOT_TOKEN")
        
    async def register_user(self, telegram_id: int, first_name: str, last_name: str = None,
                           username: str = None, avatar_url: str = None,
                           referral_code: str = None) -> Optional[Dict[Any, Any]]:
        """
        Регистрация пользователя через API
        """
        async with aiohttp.ClientSession() as session:
            try:
                payload = {
                    'telegram_id': telegram_id,
                    'first_name': first_name,
                    'last_name': last_name,
                    'username': username,
                    'avatar_url': avatar_url,
                    'referral_code': referral_code
                }

                async with session.post(
                    f"{self.base_url}/api/users/register",
                    json=payload
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        # Возвращаем профиль пользователя в формате, совместимом с прямым доступом к БД
                        profile = result.get('profile', result)

                        # Преобразуем поля для совместимости с результатами asyncpg
                        if profile and isinstance(profile, dict):
                            # Убедимся, что возвращаемые поля соответствуют ожидаемому формату
                            compatible_profile = {
                                'id': profile.get('id'),
                                'telegram_id': profile.get('telegram_id'),
                                'telegram_username': profile.get('telegram_username') or profile.get('username'),
                                'first_name': profile.get('first_name'),
                                'last_name': profile.get('last_name'),
                                'avatar_url': profile.get('avatar_url'),
                                'referral_code': profile.get('referral_code'),
                                'referred_by': profile.get('referred_by'),
                                'created_at': profile.get('created_at')
                            }
                            return compatible_profile
                        return profile
                    else:
                        print(f"Error registering user: {response.status}")
                        error_text = await response.text()
                        print(f"Error details: {error_text}")
                        return None
            except Exception as e:
                print(f"Exception during user registration: {e}")
                return None

    async def get_user(self, telegram_id: int) -> Optional[Dict[Any, Any]]:
        """
        Получение информации о пользователе через API
        """
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/api/users/{telegram_id}"
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        # Возвращаем профиль пользователя в формате, совместимом с прямым доступом к БД
                        profile = result.get('profile', result)

                        # Преобразуем поля для совместимости с результатами asyncpg
                        if profile and isinstance(profile, dict):
                            # Убедимся, что возвращаемые поля соответствуют ожидаемому формату
                            compatible_profile = {
                                'id': profile.get('id'),
                                'telegram_id': profile.get('telegram_id'),
                                'telegram_username': profile.get('telegram_username') or profile.get('username'),
                                'first_name': profile.get('first_name'),
                                'last_name': profile.get('last_name'),
                                'avatar_url': profile.get('avatar_url'),
                                'referral_code': profile.get('referral_code'),
                                'referred_by': profile.get('referred_by'),
                                'created_at': profile.get('created_at')
                            }
                            return compatible_profile
                        return profile
                    else:
                        print(f"Error getting user: {response.status}")
                        error_text = await response.text()
                        print(f"Error details: {error_text}")
                        return None
            except Exception as e:
                print(f"Exception during getting user: {e}")
                return None

# Global API client instance
api_client = ApiClient()