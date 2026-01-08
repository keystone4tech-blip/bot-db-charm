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

        # Используем анонимный ключ для всех операций
        self.client: Client = create_client(self.url, self.key)
        self.service_client = self.client  # Используем один и тот же клиент

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
        """Создает нового пользователя через прямой вызов Supabase с сервисным ключом"""
        try:
            new_id = str(uuid.uuid4())

            # Генерируем реферальный код
            def generate_referral_code(telegram_id):
                chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                code = ''
                seed = str(telegram_id)
                for i in range(8):
                    char_index = (int(seed[i % len(seed)]) + i * 7) % len(chars)
                    code += chars[char_index]
                return code

            new_referral_code = generate_referral_code(telegram_id)

            # Найдем реферера по реферальному коду, если он предоставлен
            referrer_id = None
            if referral_code:
                response = self.service_client.table('profiles').select('id').eq('referral_code', referral_code.upper()).execute()
                if response.data:
                    referrer_id = response.data[0]['id']

            # Подготовим данные пользователя
            user_data = {
                'id': new_id,
                'telegram_id': telegram_id,
                'telegram_username': username,
                'first_name': first_name,
                'last_name': last_name,
                'avatar_url': avatar_url,
                'referral_code': new_referral_code,
                'referred_by': referrer_id
            }

            # Попробуем вставить пользователя
            response = self.service_client.table('profiles').insert(user_data).execute()

            if response.data:
                user_id = response.data[0]['id']

                # Создаем связанные записи
                # Баланс
                self.service_client.table('balances').insert({
                    'user_id': user_id,
                    'internal_balance': 0,
                    'external_balance': 0,
                    'total_earned': 0,
                    'total_withdrawn': 0
                }).execute()

                # Статистика пользователя
                self.service_client.table('user_stats').insert({
                    'user_id': user_id,
                    'total_logins': 1,
                    'last_login_at': 'now()'
                }).execute()

                # Статистика рефералов
                self.service_client.table('referral_stats').insert({
                    'user_id': user_id,
                    'total_referrals': 0,
                    'total_earnings': 0
                }).execute()

                # Роль пользователя
                self.service_client.table('user_roles').insert({
                    'user_id': user_id,
                    'role': 'user'
                }).execute()

                # Если есть реферер, создаем запись о реферале
                if referrer_id:
                    self.service_client.table('referrals').insert({
                        'referrer_id': referrer_id,
                        'referred_id': user_id,
                        'level': 1,
                        'is_active': True
                    }).execute()

                    # Обновляем статистику реферала у пригласившего
                    try:
                        # Получаем текущую статистику
                        stats_response = self.service_client.table('referral_stats').select('*').eq('user_id', referrer_id).execute()
                        if stats_response.data:
                            current_stats = stats_response.data[0]
                            new_total_referrals = current_stats.get('total_referrals', 0) + 1
                            new_level_1_count = current_stats.get('level_1_count', 0) + 1

                            # Обновляем статистику
                            self.service_client.table('referral_stats').update({
                                'total_referrals': new_total_referrals,
                                'level_1_count': new_level_1_count
                            }).eq('user_id', referrer_id).execute()
                    except Exception as e:
                        print(f"Ошибка при обновлении статистики реферала: {e}")

                return response.data[0]
            return None
        except Exception as e:
            print(f"Ошибка при создании пользователя: {e}")
            return None

    async def _create_related_records(self, user_id: str):
        """Заглушка - все записи создаются через RPC функцию register_telegram_user"""
        # Эта функция больше не нужна, так как все записи создаются через RPC функцию
        pass

    async def update_user_login_stats(self, user_id: str):
        """Обновляет статистику входа пользователя"""
        try:
            # Получаем текущую статистику
            stats_response = self.service_client.table('user_stats').select('total_logins').eq('user_id', user_id).execute()
            if stats_response.data:
                current_logins = stats_response.data[0].get('total_logins', 0)
                
                stats_data = {
                    'total_logins': current_logins + 1,
                    'last_login_at': 'now()'
                }
                self.service_client.table('user_stats').update(stats_data).eq('user_id', user_id).execute()
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
            self.service_client.table('referrals').insert(referral_data).execute()
        except Exception as e:
            print(f"Ошибка при создании реферальной записи: {e}")

    async def get_user_by_referral_code(self, referral_code: str) -> Optional[Dict[str, Any]]:
        """Получает пользователя по реферальному коду"""
        try:
            response = self.client.table('profiles').select('id, telegram_id, first_name').eq('referral_code', referral_code.upper()).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Ошибка при поиске пользователя по реферальному коду: {e}")
            return None

# Глобальный экземпляр клиента
supabase_client = SupabaseClient()