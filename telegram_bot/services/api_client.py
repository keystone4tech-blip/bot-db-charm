import aiohttp
import logging
from typing import Optional, Dict, Any
from telegram_bot.config import API_BASE_URL, API_TIMEOUT

logger = logging.getLogger(__name__)

class ApiClient:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.timeout = API_TIMEOUT
    
    async def register_user(self, telegram_id: int, first_name: str, username: str = None,
                           referral_code: str = None) -> Optional[Dict[str, Any]]:
        """
        Регистрация пользователя через backend API
        """
        async with aiohttp.ClientSession() as session:
            try:
                payload = {
                    'telegram_id': telegram_id,
                    'first_name': first_name,
                    'username': username,
                    'referral_code': referral_code
                }

                async with session.post(
                    f"{self.base_url}/users/register",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=self.timeout)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"User registered successfully: {telegram_id}")
                        return result
                    else:
                        error_text = await response.text()
                        logger.error(f"API error {response.status}: {error_text}")
                        return None
            except Exception as e:
                logger.error(f"Error registering user: {e}")
                return None
    
    async def verify_referral_code(self, referral_code: str) -> Optional[Dict[str, Any]]:
        """
        Проверка реферального кода через backend API
        """
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{self.base_url}/referral-code/verify",
                    json={'referral_code': referral_code},
                    timeout=aiohttp.ClientTimeout(total=self.timeout)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"Referral code verified: {referral_code}")
                        return result
                    else:
                        error_text = await response.text()
                        logger.error(f"API error {response.status}: {error_text}")
                        return None
            except Exception as e:
                logger.error(f"Error verifying referral code: {e}")
                return None

# Global instance
api_client = ApiClient()
