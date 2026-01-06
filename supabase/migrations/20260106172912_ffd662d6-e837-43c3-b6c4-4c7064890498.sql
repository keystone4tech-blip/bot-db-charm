-- Enum для ролей пользователей
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Enum для статусов
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'referral_bonus', 'subscription_payment', 'vpn_payment', 'transfer');

-- Таблица профилей пользователей
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  email TEXT,
  bio TEXT,
  referral_code TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  referred_by UUID REFERENCES public.profiles(id),
  referral_level INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица ролей пользователей
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Таблица балансов (внутренний и внешний)
CREATE TABLE public.balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  internal_balance DECIMAL(15, 2) DEFAULT 0.00,
  external_balance DECIMAL(15, 2) DEFAULT 0.00,
  total_earned DECIMAL(15, 2) DEFAULT 0.00,
  total_withdrawn DECIMAL(15, 2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица транзакций
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  balance_type TEXT CHECK (balance_type IN ('internal', 'external')) NOT NULL,
  description TEXT,
  reference_id UUID,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица подписок
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('basic', 'standard', 'premium', 'enterprise')) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status subscription_status DEFAULT 'pending',
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица VPN ключей
CREATE TABLE public.vpn_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  key_value TEXT UNIQUE NOT NULL,
  server_location TEXT NOT NULL,
  protocol TEXT DEFAULT 'WireGuard',
  status subscription_status DEFAULT 'pending',
  bandwidth_limit BIGINT,
  bandwidth_used BIGINT DEFAULT 0,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  last_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица ботов пользователей
CREATE TABLE public.user_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  bot_token TEXT NOT NULL,
  bot_username TEXT,
  bot_name TEXT NOT NULL,
  bot_type TEXT CHECK (bot_type IN ('personal', 'referral', 'promotion')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  webhook_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица Telegram каналов для продвижения
CREATE TABLE public.telegram_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  channel_id BIGINT NOT NULL,
  channel_username TEXT,
  channel_title TEXT NOT NULL,
  subscribers_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица рефералов (5 уровней)
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  level INT CHECK (level >= 1 AND level <= 5) NOT NULL,
  earnings DECIMAL(15, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (referrer_id, referred_id)
);

-- Таблица статистики рефералов
CREATE TABLE public.referral_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  level_1_count INT DEFAULT 0,
  level_2_count INT DEFAULT 0,
  level_3_count INT DEFAULT 0,
  level_4_count INT DEFAULT 0,
  level_5_count INT DEFAULT 0,
  total_referrals INT DEFAULT 0,
  total_earnings DECIMAL(15, 2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица обращений в техподдержку
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT CHECK (category IN ('billing', 'technical', 'vpn', 'referral', 'other')) NOT NULL,
  status ticket_status DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  assigned_to UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица сообщений в тикетах
CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица статистики пользователя
CREATE TABLE public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_logins INT DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  total_transactions INT DEFAULT 0,
  total_spent DECIMAL(15, 2) DEFAULT 0.00,
  active_subscriptions INT DEFAULT 0,
  active_vpn_keys INT DEFAULT 0,
  bots_created INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Включаем RLS для всех таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vpn_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Функция для проверки роли (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON ur.user_id = p.id
    WHERE p.user_id = _user_id AND ur.role = _role
  )
$$;

-- Функция для получения profile_id по auth.uid()
CREATE OR REPLACE FUNCTION public.get_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- RLS политики для profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- RLS политики для user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS политики для balances
CREATE POLICY "Users can view own balance" ON public.balances
  FOR SELECT USING (user_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only system can modify balances" ON public.balances
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS политики для transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (user_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'));

-- RLS политики для subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (user_id = public.get_profile_id());

-- RLS политики для vpn_keys
CREATE POLICY "Users can view own VPN keys" ON public.vpn_keys
  FOR SELECT USING (user_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'));

-- RLS политики для user_bots
CREATE POLICY "Users can manage own bots" ON public.user_bots
  FOR ALL USING (user_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'));

-- RLS политики для telegram_channels
CREATE POLICY "Users can manage own channels" ON public.telegram_channels
  FOR ALL USING (user_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'));

-- RLS политики для referrals
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (referrer_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'));

-- RLS политики для referral_stats
CREATE POLICY "Users can view own referral stats" ON public.referral_stats
  FOR SELECT USING (user_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'));

-- RLS политики для support_tickets
CREATE POLICY "Users can manage own tickets" ON public.support_tickets
  FOR ALL USING (user_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'));

-- RLS политики для ticket_messages
CREATE POLICY "Users can view ticket messages" ON public.ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets st 
      WHERE st.id = ticket_id AND (st.user_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can send ticket messages" ON public.ticket_messages
  FOR INSERT WITH CHECK (sender_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'));

-- RLS политики для user_stats
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING (user_id = public.get_profile_id() OR public.has_role(auth.uid(), 'admin'));

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_balances_updated_at BEFORE UPDATE ON public.balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_bots_updated_at BEFORE UPDATE ON public.user_bots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referral_stats_updated_at BEFORE UPDATE ON public.referral_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Индексы для производительности
CREATE INDEX idx_profiles_telegram_id ON public.profiles(telegram_id);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_level ON public.referrals(level);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_vpn_keys_user_id ON public.vpn_keys(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);