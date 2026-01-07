import asyncpg
import os
from typing import Optional
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Получаем параметры подключения из переменных окружения
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
        
        # Проверяем и создаем таблицы при подключении
        await self.check_and_create_tables()

    async def disconnect(self):
        """Закрывает пул соединений"""
        if self.pool:
            await self.pool.close()
            print("Подключение к базе данных закрыто")

    async def check_and_create_tables(self):
        """Проверяет наличие всех таблиц и столбцов в базе данных и создает/обновляет их при необходимости"""
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
            await self.ensure_telegram_channels_table(connection)
            await self.ensure_user_bots_table(connection)
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

    async def ensure_telegram_channels_table(self, connection):
        """Проверяет и создает/обновляет таблицу telegram_channels"""
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'telegram_channels'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу telegram_channels...")
            await connection.execute("""
                -- Таблица телеграм каналов
                CREATE TABLE telegram_channels (
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
                CREATE INDEX idx_channels_user_id ON telegram_channels(user_id);
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
                        WHERE table_name = 'telegram_channels' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу telegram_channels...")
                    if col_name == 'id':
                        await connection.execute(f"ALTER TABLE telegram_channels ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE telegram_channels ADD CONSTRAINT pk_telegram_channels_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                        await connection.execute(f"ALTER TABLE telegram_channels ADD COLUMN {col_name} UUID NOT NULL")
                        await connection.execute(f"ALTER TABLE telegram_channels ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE telegram_channels ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

    async def ensure_user_bots_table(self, connection):
        """Проверяет и создает/обновляет таблицу user_bots"""
        table_exists = await connection.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'user_bots'
            );
        """)
        
        if not table_exists:
            print("Создаем таблицу user_bots...")
            await connection.execute("""
                -- Таблица ботов пользователя
                CREATE TABLE user_bots (
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
                CREATE INDEX idx_bots_user_id ON user_bots(user_id);
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
                        WHERE table_name = 'user_bots' AND column_name = '{col_name}'
                    );
                """)
                if not column_exists:
                    print(f"Добавляем столбец {col_name} в таблицу user_bots...")
                    if col_name == 'id':
                        await connection.execute(f"ALTER TABLE user_bots ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE user_bots ADD CONSTRAINT pk_user_bots_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
                        await connection.execute(f"ALTER TABLE user_bots ADD COLUMN {col_name} UUID NOT NULL")
                        await connection.execute(f"ALTER TABLE user_bots ADD FOREIGN KEY ({col_name}) REFERENCES {ref_part}")
                    else:
                        await connection.execute(f"ALTER TABLE user_bots ADD COLUMN {col_name} {col_def.replace('PRIMARY KEY', '')}")

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