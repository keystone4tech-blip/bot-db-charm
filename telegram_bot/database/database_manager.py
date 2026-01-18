import asyncpg
import os
from typing import Optional
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Определяем способ подключения: через API клиент, DB API, Supabase или напрямую к БД
USE_API_CLIENT = os.getenv("USE_API_CLIENT", "false").lower() == "true"
USE_DB_API = os.getenv("USE_DB_API", "false").lower() == "true"
USE_SUPABASE = os.getenv("USE_SUPABASE", "false").lower() == "true"
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if USE_API_CLIENT:
    # Используем API клиент для взаимодействия с Node.js сервером
    from ..api_client import api_client
elif USE_SUPABASE:
    # Используем Supabase клиент
    from supabase import create_client, Client
    from ..supabase_client import supabase_client
else:
    # Используем прямое подключение к базе данных
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")

    # Формируем строку подключения
    if DB_HOST and DB_USER and DB_PASSWORD and DB_NAME:
        DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    else:
        # Резервный вариант - старые переменные
        DATABASE_URL = os.getenv("POSTGRES_DATABASE_URL", os.getenv("DATABASE_URL"))

class Database:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
        self.use_supabase = USE_SUPABASE
        self.use_api_client = USE_API_CLIENT
        self.use_db_api = USE_DB_API
        self.supabase_service_role_key = SUPABASE_SERVICE_ROLE_KEY

    async def connect(self):
        """Создает подключение к базе данных или инициализирует API клиент"""
        if self.use_api_client:
            print("Используется API клиент для взаимодействия с Node.js сервером")
            # При использовании API клиента не нужно подключаться к БД напрямую
        elif self.use_db_api:
            print("Используется DB API для безопасного доступа к базе данных")
            # Импортируем DB API клиент
            from ..db_api_client import db_api_client
            self.db_api_client = db_api_client
        elif self.use_db_api:
            print("Используется DB API для безопасного доступа к базе данных")
            # Импортируем DB API клиент
            from ..db_api_client import db_api_client
            self.db_api_client = db_api_client
        elif self.use_supabase:
            print("Используется Supabase для хранения данных")
            # Подключение к Supabase уже инициализировано в supabase_client
        else:
            if not DATABASE_URL:
                raise ValueError("Не найдена строка подключения к базе данных. Установите переменную окружения SUPABASE_DATABASE_URL")

            self.pool = await asyncpg.create_pool(
                DATABASE_URL,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            print("Подключение к базе данных установлено")

    async def get_user_by_telegram_id(self, telegram_id: int):
        """Получает пользователя по telegram_id"""
        if self.use_api_client:
            # Используем API клиент для получения пользователя
            from ..api_client import api_client
            return await api_client.get_user(telegram_id)
        elif self.use_db_api:
            # Используем DB API клиент для получения пользователя
            from ..db_api_client import db_api_client
            return db_api_client.get_user_by_telegram_id(telegram_id)
        elif self.use_supabase:
            # Используем Supabase клиент для получения пользователя
            from ..supabase_client import supabase_client
            return await supabase_client.get_user_by_telegram_id(telegram_id)
        else:
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

    async def get_user_by_referral_code(self, referral_code: str):
        """Получает пользователя по реферальному коду"""
        if self.use_api_client:
            # API клиент не имеет прямого метода для этого, используем verify
            from ..api_client import api_client
            result = await api_client.verify_referral_code(referral_code)
            if result and result.get('valid'):
                return result.get('user')
            return None
        elif self.use_db_api:
            # Используем DB API клиент для получения пользователя
            from ..db_api_client import db_api_client
            return db_api_client.get_user_by_referral_code(referral_code)
        elif self.use_supabase:
            # Используем Supabase клиент для получения пользователя
            from ..supabase_client import supabase_client
            return await supabase_client.get_user_by_referral_code(referral_code)
        else:
            if not self.pool:
                raise Exception("База данных не подключена")

            async with self.pool.acquire() as connection:
                query = """
                    SELECT id, telegram_id, telegram_username, first_name, last_name,
                           avatar_url, referral_code, referred_by, created_at
                    FROM profiles
                    WHERE referral_code = $1
                """
                return await connection.fetchrow(query, referral_code.upper())

    async def create_user(self, telegram_id: int, first_name: str, last_name: str = None,
                          username: str = None, avatar_url: str = None, referral_code: str = None,
                          referred_by: str = None):
        """Создает нового пользователя"""
        if self.use_api_client:
            # Используем API клиент для создания пользователя
            from ..api_client import api_client
            return await api_client.register_user(
                telegram_id=telegram_id,
                first_name=first_name,
                last_name=last_name,
                username=username,
                avatar_url=avatar_url,
                referral_code=referral_code
            )
        elif self.use_db_api:
            # Используем DB API клиент для создания пользователя
            from ..db_api_client import db_api_client
            user_data = {
                'telegram_id': telegram_id,
                'telegram_username': username,
                'first_name': first_name,
                'last_name': last_name,
                'avatar_url': avatar_url,
                'referral_code': referral_code,
                'referred_by': referred_by
            }
            return db_api_client.create_user(user_data)
        elif self.use_supabase:
            # Используем Supabase клиент для создания пользователя
            from ..supabase_client import supabase_client
            return await supabase_client.create_user(
                telegram_id, first_name, last_name, username,
                avatar_url, referral_code, referred_by
            )
        else:
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

            # Проверяем и создаем таблицы при подключении
            await self.check_and_create_tables()

    async def disconnect(self):
        """Закрывает пул соединений или завершает работу с API клиентом"""
        if not self.use_api_client and not self.use_supabase and self.pool:
            await self.pool.close()
            print("Подключение к базе данных закрыто")
        elif self.use_api_client:
            print("Отключение от API клиента завершено")
        elif self.use_supabase:
            print("Отключение от Supabase завершено")

    async def check_and_create_tables(self):
        """Проверяет наличие всех таблиц и столбцов в базе данных и создает/обновляет их при необходимости"""
        if self.use_api_client or self.use_supabase:
            # При использовании API клиента или Supabase, управление схемой базы данных осуществляется на сервере
            print(f"Пропускаем проверку и создание таблиц - используется {'API клиент' if self.use_api_client else 'Supabase'}")
            return

        if not self.pool:
            raise Exception("База данных не подключена")

        async with self.pool.acquire() as connection:
            # Проверяем и создаем/обновляем таблицы
            await self.ensure_profiles_table(connection)
            await self.ensure_referrals_table(connection)
            await self.ensure_balances_table(connection)
            await self.ensure_user_stats_table(connection)
            await self.ensure_referral_stats_table(connection)
            await self.ensure_subscriptions_table(connection)
            await self.ensure_vpn_keys_table(connection)
            await self.ensure_channels_table(connection)
            await self.ensure_bots_table(connection)
            await self.ensure_user_roles_table(connection)
            await self.ensure_support_tickets_table(connection)

            print("Структура базы данных проверена и обновлена при необходимости")

    async def ensure_profiles_table(self, connection):
        """Проверяет и создает/обновляет таблицу profiles"""
        # Проверяем, существует ли таблица
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'profiles'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу profiles...")
            await connection.execute("""
                -- Таблица пользователей
                CREATE TABLE profiles (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    telegram_id BIGINT UNIQUE NOT NULL,
                    telegram_username VARCHAR(255),
                    first_name VARCHAR(255) NOT NULL,
                    last_name VARCHAR(255),
                    avatar_url TEXT,
                    referral_code VARCHAR(50) UNIQUE,
                    referred_by UUID REFERENCES profiles(id),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                -- Индекс для быстрого поиска по Telegram ID
                CREATE INDEX idx_profiles_telegram_id ON profiles(telegram_id);

                -- Индекс для быстрого поиска по реферальному коду
                CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
            """)
        else:
            # Проверяем и добавляем отсутствующие столбцы в таблицу profiles
            columns_to_check = {
                'id': 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
                'telegram_id': 'BIGINT UNIQUE NOT NULL',
                'telegram_username': 'VARCHAR(255)',
                'first_name': 'VARCHAR(255) NOT NULL',
                'last_name': 'VARCHAR(255)',
                'avatar_url': 'TEXT',
                'referral_code': 'VARCHAR(50) UNIQUE',
                'referred_by': 'UUID REFERENCES profiles(id)',
                'created_at': 'TIMESTAMP DEFAULT NOW()',
                'updated_at': 'TIMESTAMP DEFAULT NOW()'
            }

            for col_name, col_def in columns_to_check.items():
                column_exists = await connection.fetchval(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'profiles' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу profiles...")
                    if col_name == 'id':
                        # Для первичного ключа создаем отдельно
                        await connection.execute(f"ALTER TABLE profiles ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE profiles ADD CONSTRAINT pk_profiles_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        # Для внешних ключей сначала добавляем столбец, потом создаем связь
                        ref_part = col_def.split('REFERENCES')[1].strip()
                        await connection.execute(f"ALTER TABLE profiles ADD COLUMN {col_name} UUID")
                        await connection.execute(f"ALTER TABLE profiles ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE profiles ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

    async def ensure_referrals_table(self, connection):
        """Проверяет и создает/обновляет таблицу referrals"""
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'referrals'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу referrals...")
            await connection.execute("""
                -- Таблица рефералов
                CREATE TABLE referrals (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    level INTEGER DEFAULT 1,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    
                    -- Один пользователь не может быть рефералом одного и того же пригласившего несколько раз
                    CONSTRAINT unique_referral_per_referrer UNIQUE (referrer_id, referred_id)
                );

                -- Индекс для быстрого поиска рефералов по пригласившему
                CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
                CREATE INDEX idx_referrals_referred ON referrals(referred_id);
            """)
        else:
            # Проверяем и добавляем отсутствующие столбцы в таблицу referrals
            columns_to_check = {
                'id': 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
                'referrer_id': 'UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE',
                'referred_id': 'UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE',
                'level': 'INTEGER DEFAULT 1',
                'is_active': 'BOOLEAN DEFAULT TRUE',
                'created_at': 'TIMESTAMP DEFAULT NOW()'
            }

            for col_name, col_def in columns_to_check.items():
                column_exists = await connection.fetchval(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'referrals' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу referrals...")
                    if col_name == 'id':
                        await connection.execute(f"ALTER TABLE referrals ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE referrals ADD CONSTRAINT pk_referrals_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                        await connection.execute(f"ALTER TABLE referrals ADD COLUMN {col_name} UUID NOT NULL")
                        await connection.execute(f"ALTER TABLE referrals ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE referrals ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

    async def ensure_balances_table(self, connection):
        """Проверяет и создает/обновляет таблицу balances"""
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'balances'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу balances...")
            await connection.execute("""
                -- Таблица балансов пользователей
                CREATE TABLE balances (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    internal_balance DECIMAL(10, 2) DEFAULT 0.00,
                    external_balance DECIMAL(10, 2) DEFAULT 0.00,
                    total_earned DECIMAL(10, 2) DEFAULT 0.00,
                    total_withdrawn DECIMAL(10, 2) DEFAULT 0.00,
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                -- Индекс для быстрого поиска баланса по пользователю
                CREATE INDEX idx_balances_user_id ON balances(user_id);
            """)
        else:
            columns_to_check = {
                'id': 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
                'user_id': 'UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE',
                'internal_balance': 'DECIMAL(10, 2) DEFAULT 0.00',
                'external_balance': 'DECIMAL(10, 2) DEFAULT 0.00',
                'total_earned': 'DECIMAL(10, 2) DEFAULT 0.00',
                'total_withdrawn': 'DECIMAL(10, 2) DEFAULT 0.00',
                'updated_at': 'TIMESTAMP DEFAULT NOW()'
            }

            for col_name, col_def in columns_to_check.items():
                column_exists = await connection.fetchval(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'balances' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу balances...")
                    if col_name == 'id':
                        await connection.execute(f"ALTER TABLE balances ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE balances ADD CONSTRAINT pk_balances_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                        await connection.execute(f"ALTER TABLE balances ADD COLUMN {col_name} UUID NOT NULL")
                        await connection.execute(f"ALTER TABLE balances ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE balances ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

    async def ensure_user_stats_table(self, connection):
        """Проверяет и создает/обновляет таблицу user_stats"""
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'user_stats'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу user_stats...")
            await connection.execute("""
                -- Таблица статистики пользователей
                CREATE TABLE user_stats (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    total_logins INTEGER DEFAULT 0,
                    last_login_at TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                -- Индекс для быстрого поиска статистики по пользователю
                CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
            """)
        else:
            columns_to_check = {
                'id': 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
                'user_id': 'UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE',
                'total_logins': 'INTEGER DEFAULT 0',
                'last_login_at': 'TIMESTAMP',
                'updated_at': 'TIMESTAMP DEFAULT NOW()'
            }

            for col_name, col_def in columns_to_check.items():
                column_exists = await connection.fetchval(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'user_stats' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу user_stats...")
                    if col_name == 'id':
                        await connection.execute(f"ALTER TABLE user_stats ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE user_stats ADD CONSTRAINT pk_user_stats_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                        await connection.execute(f"ALTER TABLE user_stats ADD COLUMN {col_name} UUID NOT NULL")
                        await connection.execute(f"ALTER TABLE user_stats ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE user_stats ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

    async def ensure_referral_stats_table(self, connection):
        """Проверяет и создает/обновляет таблицу referral_stats"""
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'referral_stats'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу referral_stats...")
            await connection.execute("""
                -- Таблица статистики по рефералам
                CREATE TABLE referral_stats (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    total_referrals INTEGER DEFAULT 0,
                    total_earnings DECIMAL(10, 2) DEFAULT 0.00,
                    level_1_count INTEGER DEFAULT 0,
                    level_2_count INTEGER DEFAULT 0,
                    level_3_count INTEGER DEFAULT 0,
                    level_4_count INTEGER DEFAULT 0,
                    level_5_count INTEGER DEFAULT 0,
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                -- Индекс для быстрого поиска статистики по пользователю
                CREATE INDEX idx_referral_stats_user_id ON referral_stats(user_id);
            """)
        else:
            columns_to_check = {
                'id': 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
                'user_id': 'UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE',
                'total_referrals': 'INTEGER DEFAULT 0',
                'total_earnings': 'DECIMAL(10, 2) DEFAULT 0.00',
                'level_1_count': 'INTEGER DEFAULT 0',
                'level_2_count': 'INTEGER DEFAULT 0',
                'level_3_count': 'INTEGER DEFAULT 0',
                'level_4_count': 'INTEGER DEFAULT 0',
                'level_5_count': 'INTEGER DEFAULT 0',
                'updated_at': 'TIMESTAMP DEFAULT NOW()'
            }

            for col_name, col_def in columns_to_check.items():
                column_exists = await connection.fetchval(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'referral_stats' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу referral_stats...")
                    if col_name == 'id':
                        await connection.execute(f"ALTER TABLE referral_stats ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE referral_stats ADD CONSTRAINT pk_referral_stats_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                        await connection.execute(f"ALTER TABLE referral_stats ADD COLUMN {col_name} UUID NOT NULL")
                        await connection.execute(f"ALTER TABLE referral_stats ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE referral_stats ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

    async def ensure_subscriptions_table(self, connection):
        """Проверяет и создает/обновляет таблицу subscriptions"""
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'subscriptions'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу subscriptions...")
            await connection.execute("""
                -- Таблица подписок
                CREATE TABLE subscriptions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    plan_name VARCHAR(100) NOT NULL,
                    plan_type VARCHAR(50) NOT NULL,
                    status VARCHAR(20) DEFAULT 'inactive',
                    expires_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                -- Индекс для быстрого поиска активных подписок
                CREATE INDEX idx_subscriptions_user_id_status ON subscriptions(user_id, status);
                CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);
            """)
        else:
            columns_to_check = {
                'id': 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
                'user_id': 'UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE',
                'plan_name': 'VARCHAR(100) NOT NULL',
                'plan_type': 'VARCHAR(50) NOT NULL',
                'status': 'VARCHAR(20) DEFAULT \'inactive\'',
                'expires_at': 'TIMESTAMP',
                'created_at': 'TIMESTAMP DEFAULT NOW()',
                'updated_at': 'TIMESTAMP DEFAULT NOW()'
            }

            for col_name, col_def in columns_to_check.items():
                column_exists = await connection.fetchval(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'subscriptions' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу subscriptions...")
                    if col_name == 'id':
                        await connection.execute(f"ALTER TABLE subscriptions ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE subscriptions ADD CONSTRAINT pk_subscriptions_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                        await connection.execute(f"ALTER TABLE subscriptions ADD COLUMN {col_name} UUID NOT NULL")
                        await connection.execute(f"ALTER TABLE subscriptions ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE subscriptions ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

    async def ensure_vpn_keys_table(self, connection):
        """Проверяет и создает/обновляет таблицу vpn_keys"""
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'vpn_keys'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу vpn_keys...")
            await connection.execute("""
                -- Таблица ключей VPN
                CREATE TABLE vpn_keys (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    status VARCHAR(20) DEFAULT 'inactive',
                    expires_at TIMESTAMP,
                    server_location VARCHAR(100),
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                -- Индекс для быстрого поиска VPN ключей по пользователю
                CREATE INDEX idx_vpn_keys_user_id ON vpn_keys(user_id);
            """)
        else:
            columns_to_check = {
                'id': 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
                'user_id': 'UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE',
                'status': 'VARCHAR(20) DEFAULT \'inactive\'',
                'expires_at': 'TIMESTAMP',
                'server_location': 'VARCHAR(100)',
                'created_at': 'TIMESTAMP DEFAULT NOW()',
                'updated_at': 'TIMESTAMP DEFAULT NOW()'
            }

            for col_name, col_def in columns_to_check.items():
                column_exists = await connection.fetchval(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'vpn_keys' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу vpn_keys...")
                    if col_name == 'id':
                        await connection.execute(f"ALTER TABLE vpn_keys ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE vpn_keys ADD CONSTRAINT pk_vpn_keys_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                        await connection.execute(f"ALTER TABLE vpn_keys ADD COLUMN {col_name} UUID NOT NULL")
                        await connection.execute(f"ALTER TABLE vpn_keys ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE vpn_keys ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

    async def ensure_channels_table(self, connection):
        """Проверяет и создает/обновляет таблицу channels"""
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'channels'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу channels...")
            await connection.execute("""
                -- Таблица телеграм каналов
                CREATE TABLE channels (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    channel_title VARCHAR(255) NOT NULL,
                    channel_username VARCHAR(255),
                    subscribers_count INTEGER,
                    is_verified BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                -- Индекс для быстрого поиска каналов по пользователю
                CREATE INDEX idx_channels_user_id ON channels(user_id);
            """)
        else:
            columns_to_check = {
                'id': 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
                'user_id': 'UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE',
                'channel_title': 'VARCHAR(255) NOT NULL',
                'channel_username': 'VARCHAR(255)',
                'subscribers_count': 'INTEGER',
                'is_verified': 'BOOLEAN DEFAULT FALSE',
                'created_at': 'TIMESTAMP DEFAULT NOW()',
                'updated_at': 'TIMESTAMP DEFAULT NOW()'
            }

            for col_name, col_def in columns_to_check.items():
                column_exists = await connection.fetchval(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'channels' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу channels...")
                    if col_name == 'id':
                        await connection.execute(f"ALTER TABLE channels ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE channels ADD CONSTRAINT pk_channels_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                        await connection.execute(f"ALTER TABLE channels ADD COLUMN {col_name} UUID NOT NULL")
                        await connection.execute(f"ALTER TABLE channels ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE channels ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

    async def ensure_bots_table(self, connection):
        """Проверяет и создает/обновляет таблицу bots"""
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'bots'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу bots...")
            await connection.execute("""
                -- Таблица ботов пользователя
                CREATE TABLE bots (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    bot_name VARCHAR(255) NOT NULL,
                    bot_username VARCHAR(255),
                    bot_type VARCHAR(50) DEFAULT 'unknown',
                    is_active BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                -- Индекс для быстрого поиска ботов по пользователю
                CREATE INDEX idx_bots_user_id ON bots(user_id);
            """)
        else:
            columns_to_check = {
                'id': 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
                'user_id': 'UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE',
                'bot_name': 'VARCHAR(255) NOT NULL',
                'bot_username': 'VARCHAR(255)',
                'bot_type': 'VARCHAR(50) DEFAULT \'unknown\'',
                'is_active': 'BOOLEAN DEFAULT FALSE',
                'created_at': 'TIMESTAMP DEFAULT NOW()',
                'updated_at': 'TIMESTAMP DEFAULT NOW()'
            }

            for col_name, col_def in columns_to_check.items():
                column_exists = await connection.fetchval(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'bots' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу bots...")
                    if col_name == 'id':
                        await connection.execute(f"ALTER TABLE bots ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE bots ADD CONSTRAINT pk_bots_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                        await connection.execute(f"ALTER TABLE bots ADD COLUMN {col_name} UUID NOT NULL")
                        await connection.execute(f"ALTER TABLE bots ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE bots ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

    async def ensure_user_roles_table(self, connection):
        """Проверяет и создает/обновляет таблицу user_roles"""
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'user_roles'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу user_roles...")
            await connection.execute("""
                -- Таблица ролей пользователей
                CREATE TABLE user_roles (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    role VARCHAR(50) DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT NOW()
                );

                -- Индекс для быстрого поиска роли по пользователю
                CREATE INDEX idx_roles_user_id ON user_roles(user_id);
            """)
        else:
            columns_to_check = {
                'id': 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
                'user_id': 'UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE',
                'role': 'VARCHAR(50) DEFAULT \'user\'',
                'created_at': 'TIMESTAMP DEFAULT NOW()'
            }

            for col_name, col_def in columns_to_check.items():
                column_exists = await connection.fetchval(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'user_roles' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу user_roles...")
                    if col_name == 'id':
                        await connection.execute(f"ALTER TABLE user_roles ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE user_roles ADD CONSTRAINT pk_user_roles_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                        await connection.execute(f"ALTER TABLE user_roles ADD COLUMN {col_name} UUID NOT NULL")
                        await connection.execute(f"ALTER TABLE user_roles ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE user_roles ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

    async def ensure_support_tickets_table(self, connection):
        """Проверяет и создает/обновляет таблицу support_tickets"""
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'support_tickets'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу support_tickets...")
            await connection.execute("""
                -- Таблица заявок в поддержку
                CREATE TABLE support_tickets (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
                    category VARCHAR(100) NOT NULL,
                    subject VARCHAR(255),
                    message TEXT NOT NULL,
                    status VARCHAR(20) DEFAULT 'open',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );

                -- Индекс для быстрого поиска заявок по пользователю
                CREATE INDEX idx_tickets_user_id ON support_tickets(user_id);
            """)
        else:
            columns_to_check = {
                'id': 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
                'user_id': 'UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE',
                'category': 'VARCHAR(100) NOT NULL',
                'subject': 'VARCHAR(255)',
                'message': 'TEXT NOT NULL',
                'status': 'VARCHAR(20) DEFAULT \'open\'',
                'created_at': 'TIMESTAMP DEFAULT NOW()',
                'updated_at': 'TIMESTAMP DEFAULT NOW()'
            }

            for col_name, col_def in columns_to_check.items():
                column_exists = await connection.fetchval(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns
                        WHERE table_name = 'support_tickets' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу support_tickets...")
                    if col_name == 'id':
                        await connection.execute(f"ALTER TABLE support_tickets ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE support_tickets ADD CONSTRAINT pk_support_tickets_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                        await connection.execute(f"ALTER TABLE support_tickets ADD COLUMN {col_name} UUID NOT NULL")
                        await connection.execute(f"ALTER TABLE support_tickets ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE support_tickets ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

    async def get_user_by_telegram_id(self, telegram_id: int):
        """Получает пользователя по telegram_id"""
        if self.use_api_client:
            # Используем API клиент для получения пользователя
            from ..api_client import api_client
            return await api_client.get_user(telegram_id)
        elif self.use_db_api:
            # Используем DB API клиент для получения пользователя
            from ..db_api_client import db_api_client
            return db_api_client.get_user_by_telegram_id(telegram_id)
        elif self.use_supabase:
            # Используем Supabase клиент для получения пользователя
            from ..supabase_client import supabase_client
            return await supabase_client.get_user_by_telegram_id(telegram_id)
        else:
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
        if self.use_api_client:
            # Используем API клиент для создания пользователя
            from ..api_client import api_client
            return await api_client.register_user(
                telegram_id=telegram_id,
                first_name=first_name,
                last_name=last_name,
                username=username,
                avatar_url=avatar_url,
                referral_code=referral_code
            )
        elif self.use_db_api:
            # Используем DB API клиент для создания пользователя
            from ..db_api_client import db_api_client
            user_data = {
                'telegram_id': telegram_id,
                'telegram_username': username,
                'first_name': first_name,
                'last_name': last_name,
                'avatar_url': avatar_url,
                'referral_code': referral_code,
                'referred_by': referred_by
            }
            return db_api_client.create_user(user_data)
        elif self.use_supabase:
            # Используем Supabase клиент для создания пользователя
            from ..supabase_client import supabase_client
            return await supabase_client.create_user(
                telegram_id, first_name, last_name, username,
                avatar_url, referral_code, referred_by
            )
        else:
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
        if self.use_api_client:
            # При использовании API клиента, статистика получается через веб-приложение
            # Возвращаем заглушку, так как полная реализация требует дополнительных API эндпоинтов
            return {
                'level_1_count': 0,
                'level_2_count': 0,
                'level_3_count': 0,
                'level_4_count': 0,
                'level_5_count': 0,
                'total_referrals': 0
            }
        elif self.use_supabase:
            # Используем Supabase клиент для получения статистики рефералов
            return await supabase_client.get_referral_stats(user_id)
        else:
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
        if self.use_api_client:
            # При использовании API клиента, поиск по реферальному коду требует дополнительного API эндпоинта
            # Возвращаем заглушку, так как полная реализация требует дополнительных API эндпоинтов
            return None
        elif self.use_db_api:
            # Используем DB API клиент для получения пользователя по реферальному коду
            from ..db_api_client import db_api_client
            try:
                # Ищем пользователя по реферальному коду через DB API
                result = db_api_client.select("profiles", where={"referral_code": referral_code.upper()})
                return result[0] if result and len(result) > 0 else None
            except:
                return None
        elif self.use_supabase:
            # Используем Supabase клиент для получения пользователя по реферальному коду
            return await supabase_client.get_user_by_referral_code(referral_code)
        else:
            if not self.pool:
                raise Exception("База данных не подключена")

            async with self.pool.acquire() as connection:
                query = "SELECT id, telegram_id FROM profiles WHERE referral_code = $1"
                return await connection.fetchrow(query, referral_code)

    async def create_referral_record(self, referrer_id: str, referred_id: str, level: int = 1):
        """Создает запись о реферале"""
        if self.use_api_client:
            # При использовании API клиента, создание реферальных записей требует дополнительного API эндпоинта
            # Возвращаем заглушку, так как полная реализация требует дополнительных API эндпоинтов
            return
        elif self.use_db_api:
            # Используем DB API клиент для создания реферальной записи
            from ..db_api_client import db_api_client
            try:
                referral_data = {
                    'referrer_id': referrer_id,
                    'referred_id': referred_id,
                    'level': level,
                    'is_active': True
                }
                db_api_client.insert("referrals", referral_data)
            except Exception as e:
                print(f"Ошибка при создании реферальной записи через DB API: {e}")
        elif self.use_supabase:
            # Используем Supabase клиент для создания реферальной записи
            await supabase_client.create_referral_record(referrer_id, referred_id, level)
        else:
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