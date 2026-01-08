import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from supabase import create_client, Client
import uuid

load_dotenv()

class SupabaseClient:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        
        if not self.url or not self.key:
            raise ValueError("Необходимо указать SUPABASE_URL и SUPABASE_KEY в .env файле")
        
        self.client: Client = create_client(self.url, self.key)

    async def get_user_by_telegram_id(self, telegram_id: int) -> Optional[Dict[str, Any]]:
        """Получает пользователя по telegram_id"""
        try:
            response = self.client.table('profiles').select('*').eq('telegram_id', telegram_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Ошибка при получении пользователя: {e}")
            return None

    async def create_user(self, telegram_id: int, first_name: str, last_name: str = None,
                         username: str = None, avatar_url: str = None, referral_code: str = None,
                         referred_by: str = None) -> Optional[Dict[str, Any]]:
        """Создает нового пользователя"""
        try:
            new_id = str(uuid.uuid4())
            
            user_data = {
                'id': new_id,
                'telegram_id': telegram_id,
                'telegram_username': username,
                'first_name': first_name,
                'last_name': last_name,
                'avatar_url': avatar_url,
                'referral_code': referral_code,
                'referred_by': referred_by
            }
            
            response = self.client.table('profiles').insert(user_data).execute()
            if response.data:
                # Создаем записи в связанных таблицах
                await self._create_related_records(response.data[0]['id'])
                return response.data[0]
            return None
        except Exception as e:
            print(f"Ошибка при создании пользователя: {e}")
            return None

    async def _create_related_records(self, user_id: str):
        """Создает записи в связанных таблицах для нового пользователя"""
        try:
            # Создаем запись баланса
            balance_data = {
                'user_id': user_id,
                'internal_balance': 0,
                'external_balance': 0,
                'total_earned': 0,
                'total_withdrawn': 0
            }
            self.client.table('balances').insert(balance_data).execute()

            # Создаем запись статистики пользователя
            stats_data = {
                'user_id': user_id,
                'total_logins': 1,
                'last_login_at': 'now()'
            }
            self.client.table('user_stats').insert(stats_data).execute()

            # Создаем запись статистики по рефералам
            referral_stats_data = {
                'user_id': user_id,
                'total_referrals': 0,
                'total_earnings': 0
            }
            self.client.table('referral_stats').insert(referral_stats_data).execute()

            # Создаем запись роли пользователя
            role_data = {
                'user_id': user_id,
                'role': 'user'
            }
            self.client.table('user_roles').insert(role_data).execute()
        except Exception as e:
            print(f"Ошибка при создании связанных записей: {e}")

    async def update_user_login_stats(self, user_id: str):
        """Обновляет статистику входа пользователя"""
        try:
            # Получаем текущую статистику
            stats_response = self.client.table('user_stats').select('total_logins').eq('user_id', user_id).execute()
            if stats_response.data:
                current_logins = stats_response.data[0].get('total_logins', 0)
                
                stats_data = {
                    'total_logins': current_logins + 1,
                    'last_login_at': 'now()'
                }
                self.client.table('user_stats').update(stats_data).eq('user_id', user_id).execute()
        except Exception as e:
            print(f"Ошибка при обновлении статистики входа: {e}")

    async def get_referral_stats(self, user_id: str) -> Dict[str, Any]:
        """Получает статистику по рефералам пользователя"""
        try:
            response = self.client.table('referral_stats').select('*').eq('user_id', user_id).execute()
            if response.data:
                return response.data[0]
            return {
                'level_1_count': 0,
                'level_2_count': 0,
                'level_3_count': 0,
                'level_4_count': 0,
                'level_5_count': 0,
                'total_referrals': 0
            }
        except Exception as e:
            print(f"Ошибка при получении статистики рефералов: {e}")
            return {
                'level_1_count': 0,
                'level_2_count': 0,
                'level_3_count': 0,
                'level_4_count': 0,
                'level_5_count': 0,
                'total_referrals': 0
            }

    async def create_referral_record(self, referrer_id: str, referred_id: str, level: int = 1):
        """Создает запись о реферале"""
        try:
            referral_data = {
                'referrer_id': referrer_id,
                'referred_id': referred_id,
                'level': level,
                'is_active': True
            }
            self.client.table('referrals').insert(referral_data).execute()
        except Exception as e:
            print(f"Ошибка при создании реферальной записи: {e}")

    async def get_user_by_referral_code(self, referral_code: str) -> Optional[Dict[str, Any]]:
        """Получает пользователя по реферальному коду"""
        try:
            response = self.client.table('profiles').select('id, telegram_id').eq('referral_code', referral_code.upper()).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Ошибка при поиске пользователя по реферальному коду: {e}")
            return None

# Глобальный экземпляр клиента
supabase_client = SupabaseClient()