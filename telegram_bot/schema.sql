-- Таблица пользователей
CREATE TABLE IF NOT EXISTS profiles (
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

-- Индексы для таблицы profiles
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- Таблица рефералов
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Один пользователь не может быть рефералом одного и того же пригласившего несколько раз
    CONSTRAINT unique_referral_per_referrer UNIQUE (referrer_id, referred_id)
);

-- Индексы для таблицы referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);

-- Таблица балансов
CREATE TABLE IF NOT EXISTS balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    internal_balance DECIMAL(10, 2) DEFAULT 0.00,
    external_balance DECIMAL(10, 2) DEFAULT 0.00,
    total_earned DECIMAL(10, 2) DEFAULT 0.00,
    total_withdrawn DECIMAL(10, 2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для таблицы balances
CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);

-- Таблица статистики пользователей
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total_logins INTEGER DEFAULT 0,
    last_login_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для таблицы user_stats
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Таблица статистики по рефералам
CREATE TABLE IF NOT EXISTS referral_stats (
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

-- Индекс для таблицы referral_stats
CREATE INDEX IF NOT EXISTS idx_referral_stats_user_id ON referral_stats(user_id);

-- Таблица подписок
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'inactive',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для таблицы subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- Таблица VPN ключей
CREATE TABLE IF NOT EXISTS vpn_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'inactive',
    expires_at TIMESTAMP,
    server_location VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для таблицы vpn_keys
CREATE INDEX IF NOT EXISTS idx_vpn_keys_user_id ON vpn_keys(user_id);

-- Таблица телеграм каналов
CREATE TABLE IF NOT EXISTS telegram_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    channel_title VARCHAR(255) NOT NULL,
    channel_username VARCHAR(255),
    subscribers_count INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для таблицы telegram_channels
CREATE INDEX IF NOT EXISTS idx_channels_user_id ON telegram_channels(user_id);

-- Таблица ботов пользователей
CREATE TABLE IF NOT EXISTS user_bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    bot_name VARCHAR(255) NOT NULL,
    bot_username VARCHAR(255),
    bot_type VARCHAR(50) DEFAULT 'unknown',
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для таблицы user_bots
CREATE INDEX IF NOT EXISTS idx_bots_user_id ON user_bots(user_id);

-- Таблица ролей пользователей
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для таблицы user_roles
CREATE INDEX IF NOT EXISTS idx_roles_user_id ON user_roles(user_id);

-- Таблица тикетов поддержки
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для таблицы support_tickets
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON support_tickets(user_id);

-- Включаем Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vpn_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Создаем политики RLS для ограничения доступа к данным
-- Для анонимного ключа (frontend) - только чтение своих данных
-- Для сервисного ключа (backend/bot) - полный доступ

-- Политики для анонимного ключа (frontend) - доступ только к своим данным
CREATE POLICY "Allow own profiles access" ON profiles
FOR ALL TO anon
USING (telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid()))
WITH CHECK (telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Allow own referrals access" ON referrals
FOR ALL TO anon
USING (
    referrer_id IN (SELECT id FROM profiles WHERE telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid()))
    OR
    referred_id IN (SELECT id FROM profiles WHERE telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid()))
)
WITH CHECK (true);

CREATE POLICY "Allow own balances access" ON balances
FOR ALL TO anon
USING (user_id IN (SELECT id FROM profiles WHERE telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid())))
WITH CHECK (true);

CREATE POLICY "Allow own user_stats access" ON user_stats
FOR ALL TO anon
USING (user_id IN (SELECT id FROM profiles WHERE telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid())))
WITH CHECK (true);

CREATE POLICY "Allow own referral_stats access" ON referral_stats
FOR ALL TO anon
USING (user_id IN (SELECT id FROM profiles WHERE telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid())))
WITH CHECK (true);

CREATE POLICY "Allow own subscriptions access" ON subscriptions
FOR ALL TO anon
USING (user_id IN (SELECT id FROM profiles WHERE telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid())))
WITH CHECK (true);

CREATE POLICY "Allow own vpn_keys access" ON vpn_keys
FOR ALL TO anon
USING (user_id IN (SELECT id FROM profiles WHERE telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid())))
WITH CHECK (true);

CREATE POLICY "Allow own telegram_channels access" ON telegram_channels
FOR ALL TO anon
USING (user_id IN (SELECT id FROM profiles WHERE telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid())))
WITH CHECK (true);

CREATE POLICY "Allow own user_bots access" ON user_bots
FOR ALL TO anon
USING (user_id IN (SELECT id FROM profiles WHERE telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid())))
WITH CHECK (true);

CREATE POLICY "Allow own user_roles access" ON user_roles
FOR ALL TO anon
USING (user_id IN (SELECT id FROM profiles WHERE telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid())))
WITH CHECK (true);

CREATE POLICY "Allow own support_tickets access" ON support_tickets
FOR ALL TO anon
USING (user_id IN (SELECT id FROM profiles WHERE telegram_id = (SELECT telegram_id FROM auth.users WHERE id = auth.uid())))
WITH CHECK (true);

-- Для сервисного ключа (backend/bot) - полный доступ ко всем данным
CREATE POLICY "Allow full access for service role" ON profiles
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow full access for service role" ON referrals
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow full access for service role" ON balances
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow full access for service role" ON user_stats
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow full access for service role" ON referral_stats
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow full access for service role" ON subscriptions
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow full access for service role" ON vpn_keys
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow full access for service role" ON telegram_channels
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow full access for service role" ON user_bots
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow full access for service role" ON user_roles
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow full access for service role" ON support_tickets
FOR ALL TO service_role
USING (true)
WITH CHECK (true);