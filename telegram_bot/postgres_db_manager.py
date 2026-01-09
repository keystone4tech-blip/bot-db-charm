import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from .db_api_client import db_api_client

load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.db_api_client = db_api_client

    async def connect(self):
        """Инициализирует DB API клиент"""
        print("Используется DB API для безопасного доступа к базе данных")
        # Подключение к базе данных происходит через DB API

    async def disconnect(self):
        """Закрывает соединение с DB API"""
        print("Отключение от DB API завершено")

    async def check_and_create_tables(self):
        """Проверяет наличие всех таблиц и создает их при необходимости"""
        # При использовании DB API, управление схемой базы данных осуществляется на сервере
        print("Пропускаем проверку и создание таблиц - используется DB API")
        return

    async def ensure_profiles_table(self, connection):
        """Проверяет и создает/обновляет таблицу profiles"""
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

                -- Индексы для быстрого поиска
                CREATE INDEX idx_profiles_telegram_id ON profiles(telegram_id);
                CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
            """)
        else:
            # Проверяем и добавляем отсутствующие столбцы
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
                        await connection.execute(f"ALTER TABLE profiles ADD COLUMN {col_name} {col_def.split('PRIMARY')[0]}")
                        await connection.execute("ALTER TABLE profiles ADD CONSTRAINT pk_profiles_id PRIMARY KEY (id)")
                    elif 'REFERENCES' in col_def:
                        ref_part = col_def.split('REFERENCES')[1].split('ON')[0].strip()
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

                -- Индексы для быстрого поиска
                CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
                CREATE INDEX idx_referrals_referred ON referrals(referred_id);
            """)
        else:
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

                -- Индексы для быстрого поиска
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

    async def get_user_by_telegram_id(self, telegram_id: int) -> Optional[Dict[str, Any]]:
        """Получает пользователя по telegram_id"""
        try:
            return self.db_api_client.get_user_by_telegram_id(telegram_id)
        except Exception as e:
            print(f"Ошибка при получении пользователя: {e}")
            return None

    async def create_user(self, telegram_id: int, first_name: str, last_name: str = None,
                          username: str = None, avatar_url: str = None, referral_code: str = None,
                          referred_by: str = None) -> Optional[Dict[str, Any]]:
        """Создает нового пользователя"""
        try:
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

            user_data = {
                'telegram_id': telegram_id,
                'telegram_username': username,
                'first_name': first_name,
                'last_name': last_name,
                'avatar_url': avatar_url,
                'referral_code': new_referral_code,
                'referred_by': referred_by
            }

            result = self.db_api_client.create_user(user_data)

            if result:
                # Создаем связанные записи
                await self._create_related_records(result.get('id'))

            return result
        except Exception as e:
            print(f"Ошибка при создании пользователя: {e}")
            return None

    async def _create_related_records(self, user_id: str):
        """Создает связанные записи для нового пользователя"""
        try:
            # Создаем запись баланса
            self.db_api_client.insert("balances", {
                'user_id': user_id,
                'internal_balance': 0,
                'external_balance': 0,
                'total_earned': 0,
                'total_withdrawn': 0
            })

            # Создаем запись статистики пользователя
            self.db_api_client.insert("user_stats", {
                'user_id': user_id,
                'total_logins': 1,
                'last_login_at': 'now()'
            })

            # Создаем запись статистики по рефералам
            self.db_api_client.insert("referral_stats", {
                'user_id': user_id,
                'total_referrals': 0,
                'total_earnings': 0
            })

            # Создаем запись роли пользователя
            self.db_api_client.insert("user_roles", {
                'user_id': user_id,
                'role': 'user'
            })
        except Exception as e:
            print(f"Ошибка при создании связанных записей: {e}")

    async def get_user_by_referral_code(self, referral_code: str) -> Optional[Dict[str, Any]]:
        """Получает пользователя по реферальному коду"""
        try:
            return self.db_api_client.get_user_by_referral_code(referral_code)
        except Exception as e:
            print(f"Ошибка при поиске пользователя по реферальному коду: {e}")
            return None

    async def create_referral_record(self, referrer_id: str, referred_id: str, level: int = 1):
        """Создает запись о реферале"""
        try:
            self.db_api_client.create_referral_record(referrer_id, referred_id, level)
        except Exception as e:
            print(f"Ошибка при создании реферальной записи: {e}")


# Глобальный экземпляр базы данных
db_manager = DatabaseManager()