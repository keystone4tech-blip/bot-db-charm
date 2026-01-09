import os
import requests
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class DBAPIClient:
    def __init__(self):
        self.api_url = os.getenv("DB_API_URL", "https://jjaeybwuhnokrcprgait.supabase.co/functions/v1/db-api")
        self.api_key = os.getenv("DB_API_KEY")  # ваш_DB_API_KEY
        
        if not self.api_key:
            raise ValueError("Необходимо указать DB_API_KEY в .env файле")
        
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }

    def select(self, table: str, where: Dict[str, Any] = None) -> Optional[List[Dict[str, Any]]]:
        """Выполняет SELECT запрос к таблице"""
        try:
            payload = {
                "action": "select",
                "table": table
            }

            if where:
                payload["where"] = where

            response = requests.post(self.api_url, json=payload, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Ошибка при выполнении SELECT запроса: {e}")
            return None

    def insert(self, table: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Выполняет INSERT запрос в таблицу"""
        try:
            payload = {
                "action": "insert",
                "table": table,
                "data": data
            }
            response = requests.post(self.api_url, json=payload, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            return result[0] if isinstance(result, list) and len(result) > 0 else result
        except Exception as e:
            print(f"Ошибка при выполнении INSERT запроса: {e}")
            return None

    def update(self, table: str, data: Dict[str, Any], where: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Выполняет UPDATE запрос в таблице"""
        try:
            payload = {
                "action": "update",
                "table": table,
                "data": data,
                "where": where
            }
            response = requests.post(self.api_url, json=payload, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            return result[0] if isinstance(result, list) and len(result) > 0 else result
        except Exception as e:
            print(f"Ошибка при выполнении UPDATE запроса: {e}")
            return None

    def delete(self, table: str, where: Dict[str, Any]) -> bool:
        """Выполняет DELETE запрос из таблицы"""
        try:
            payload = {
                "action": "delete",
                "table": table,
                "where": where
            }
            response = requests.post(self.api_url, json=payload, headers=self.headers)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Ошибка при выполнении DELETE запроса: {e}")
            return False

    def get_user_by_telegram_id(self, telegram_id: int) -> Optional[Dict[str, Any]]:
        """Получает пользователя по telegram_id"""
        result = self.select("profiles", where={"telegram_id": telegram_id})
        return result[0] if result and len(result) > 0 else None

    def get_user_by_referral_code(self, referral_code: str) -> Optional[Dict[str, Any]]:
        """Получает пользователя по реферальному коду"""
        result = self.select("profiles", where={"referral_code": referral_code.upper()})
        return result[0] if result and len(result) > 0 else None

    def create_user(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Создает нового пользователя"""
        result = self.insert("profiles", user_data)
        if result:
            # Создаем связанные записи для нового пользователя
            user_id = result.get('id')
            if user_id:
                self.create_related_records(user_id)
        return result

    def create_related_records(self, user_id: str):
        """Создает связанные записи для нового пользователя"""
        try:
            # Создаем запись баланса
            self.insert("balances", {
                "user_id": user_id,
                "internal_balance": 0,
                "external_balance": 0,
                "total_earned": 0,
                "total_withdrawn": 0
            })

            # Создаем запись статистики пользователя
            self.insert("user_stats", {
                "user_id": user_id,
                "total_logins": 1,
                "last_login_at": "now()"
            })

            # Создаем запись статистики по рефералам
            self.insert("referral_stats", {
                "user_id": user_id,
                "total_referrals": 0,
                "total_earnings": 0
            })

            # Создаем запись роли пользователя
            self.insert("user_roles", {
                "user_id": user_id,
                "role": "user"
            })
        except Exception as e:
            print(f"Ошибка при создании связанных записей: {e}")

    def create_referral_record(self, referrer_id: str, referred_id: str, level: int = 1):
        """Создает запись о реферале"""
        try:
            self.insert("referrals", {
                "referrer_id": referrer_id,
                "referred_id": referred_id,
                "level": level,
                "is_active": True
            })
        except Exception as e:
            print(f"Ошибка при создании реферальной записи: {e}")

db_api_client = DBAPIClient()