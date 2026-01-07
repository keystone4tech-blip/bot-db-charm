import asyncpg
import os
from typing import Optional
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Получаем параметры подключения из переменных окружения
DATABASE_URL = os.getenv("POSTGRES_DATABASE_URL", os.getenv("DATABASE_URL"))

class Database:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        """Создает пул соединений с базой данных"""
        if not DATABASE_URL:
            raise ValueError("Не найдена строка подключения к базе данных. Установите переменную окружения SUPABASE_DATABASE_URL")
        
        self.pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=5,
            max_size=20,
            command_timeout=60
        )
        print("Подключение к базе данных установлено")

    async def disconnect(self):
        """Закрывает пул соединений"""
        if self.pool:
            await self.pool.close()
            print("Подключение к базе данных закрыто")

    async def get_user_by_telegram_id(self, telegram_id: int):
        """Получает пользователя по telegram_id"""
        if not self.pool:
            raise Exception("База данных не подключена")
        
        async with self.pool.acquire() as connection:
            query = """
                SELECT id, telegram_id, telegram_username, first_name, last_name, 
                       avatar_url, referral_code, referred_by, created_at
                FROM profiles 
                WHERE telegram_id = $1
            """
            return await connection.fetchrow(query, telegram_id)

    async def create_user(self, telegram_id: int, first_name: str, last_name: str = None, 
                          username: str = None, avatar_url: str = None, referral_code: str = None, 
                          referred_by: str = None):
        """Создает нового пользователя"""
        if not self.pool:
            raise Exception("База данных не подключена")
        
        async with self.pool.acquire() as connection:
            query = """
                INSERT INTO profiles (
                    telegram_id, telegram_username, first_name, last_name, 
                    avatar_url, referral_code, referred_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, telegram_id, created_at
            """
            return await connection.fetchrow(
                query, 
                telegram_id, username, first_name, last_name, 
                avatar_url, referral_code, referred_by
            )

    async def get_referral_stats(self, user_id: str):
        """Получает статистику по рефералам пользователя"""
        if not self.pool:
            raise Exception("База данных не подключена")
        
        async with self.pool.acquire() as connection:
            # Получаем количество рефералов на каждом уровне
            query = """
                WITH RECURSIVE referral_tree AS (
                  -- Начальный уровень (непосредственные рефералы)
                  SELECT id, referred_by, 1 as level
                  FROM profiles
                  WHERE referred_by = $1
                  
                  UNION ALL
                  
                  -- Рекурсивно находим рефералов рефералов
                  SELECT p.id, p.referred_by, rt.level + 1
                  FROM profiles p
                  JOIN referral_tree rt ON p.referred_by = rt.id
                  WHERE rt.level < 5  -- Максимум 5 уровней
                )
                SELECT 
                  COUNT(*) FILTER (WHERE level = 1) as level_1_count,
                  COUNT(*) FILTER (WHERE level = 2) as level_2_count,
                  COUNT(*) FILTER (WHERE level = 3) as level_3_count,
                  COUNT(*) FILTER (WHERE level = 4) as level_4_count,
                  COUNT(*) FILTER (WHERE level = 5) as level_5_count,
                  COUNT(*) as total_referrals
                FROM referral_tree;
            """
            return await connection.fetchrow(query, user_id)

    async def get_user_referral_code(self, referral_code: str):
        """Получает пользователя по реферальному коду"""
        if not self.pool:
            raise Exception("База данных не подключена")
        
        async with self.pool.acquire() as connection:
            query = "SELECT id, telegram_id FROM profiles WHERE referral_code = $1"
            return await connection.fetchrow(query, referral_code)

    async def create_referral_record(self, referrer_id: str, referred_id: str, level: int = 1):
        """Создает запись о реферале"""
        if not self.pool:
            raise Exception("База данных не подключена")
        
        async with self.pool.acquire() as connection:
            query = """
                INSERT INTO referrals (referrer_id, referred_id, level, is_active)
                VALUES ($1, $2, $3, TRUE)
                ON CONFLICT (referrer_id, referred_id) 
                DO UPDATE SET is_active = TRUE
            """
            await connection.execute(query, referrer_id, referred_id, level)

database = Database()