/**
 * API для работы с Supabase напрямую (без локального сервера)
 */

import { supabase } from '@/integrations/supabase/client';
import { supabaseAuth } from '@/lib/supabaseAuth';

/**
 * Интерфейс для профиля пользователя
 */
export interface UserProfile {
  id: string;
  telegram_id: number;
  telegram_username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  referred_by: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Расширенный профиль пользователя
 */
export interface ExtendedUserProfile extends UserProfile {
  city?: string;
  phone?: string;
  email?: string;
  bio?: string;
  link?: string;
}

/**
 * Интерфейс для VPN ключа
 */
export interface VPNKey {
  id: string;
  user_id: string;
  key_value: string;
  server_location: string;
  status: string;
  protocol: string | null;
  expires_at: string | null;
  activated_at: string | null;
  bandwidth_limit: number | null;
  bandwidth_used: number | null;
  last_connected_at: string | null;
  created_at: string;
}

/**
 * Интерфейс для телеграм канала
 */
export interface TelegramChannel {
  id: string;
  user_id: string;
  channel_id: number;
  channel_title: string;
  channel_username: string | null;
  subscribers_count: number | null;
  is_verified: boolean | null;
  created_at: string;
}

/**
 * Интерфейс для бота пользователя
 */
export interface UserBot {
  id: string;
  user_id: string;
  bot_name: string;
  bot_token: string;
  bot_username: string | null;
  bot_type: string;
  is_active: boolean | null;
  webhook_url: string | null;
  settings: any | null;
  created_at: string;
  updated_at: string;
}

/**
 * Интерфейс для подписки
 */
export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  plan_type: string;
  price: number;
  status: string | null;
  activated_at: string | null;
  expires_at: string | null;
  auto_renew: boolean | null;
  created_at: string;
  updated_at: string;
}

/**
 * Интерфейс для баланса пользователя
 */
export interface UserBalance {
  id: string;
  user_id: string;
  internal_balance: number;
  external_balance: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: string;
}

/**
 * Интерфейс для статистики рефералов
 */
export interface ReferralStats {
  id: string;
  user_id: string;
  total_referrals: number;
  total_earnings: number;
  level_1_count: number;
  level_2_count: number;
  level_3_count: number;
  level_4_count: number;
  level_5_count: number;
  updated_at: string;
}

/**
 * Интерфейс для ответа аутентификации
 */
export interface AuthResponse {
  success: boolean;
  profile?: UserProfile;
  balance?: UserBalance;
  referralStats?: ReferralStats;
  role?: string;
  error?: string;
}

/**
 * Генерация уникального реферального кода
 */
const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

/**
 * Аутентификация через Telegram - создаёт или обновляет профиль в Supabase
 */
export const authenticateTelegram = async (
  telegramUser: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  },
  referralCode?: string | null
): Promise<AuthResponse> => {
  try {
    console.log('🔐 Telegram Auth via edge function:', { telegramUser, referralCode });

    // Import tg to get initData for validation
    const { tg, isTelegramWebApp } = await import('@/lib/telegram');
    
    const initData = isTelegramWebApp() ? tg.initData : null;
    
    if (initData) {
      // Use the edge function which has service role access (bypasses RLS)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/telegram-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          initData,
          referralCode,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ошибка авторизации через Telegram');
      }

      console.log('✅ Auth successful via edge function:', { profileId: result.profile?.id });

      return {
        success: true,
        profile: result.profile as UserProfile,
        balance: result.balance as UserBalance | undefined,
        referralStats: result.referralStats as ReferralStats | undefined,
        role: result.role || 'user',
      };
    }

    // Fallback: no initData available (shouldn't happen in real Telegram WebApp)
    console.warn('No initData available, falling back to direct query');
    
    // Try to find existing profile by telegram_id using anon key (will work for SELECT if RLS allows)
    const { data: existingProfile, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .maybeSingle();

    if (findError) {
      console.error('Error finding profile:', findError);
      throw new Error('Ошибка поиска профиля. Откройте приложение через Telegram.');
    }

    if (!existingProfile) {
      throw new Error('Профиль не найден. Откройте приложение через Telegram бота.');
    }

    return {
      success: true,
      profile: existingProfile as UserProfile,
    };
  } catch (error) {
    console.error('❌ Telegram auth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка аутентификации',
    };
  }
};

/**
 * Аутентификация по email через Supabase Auth
 */
export const loginWithEmailSupabase = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Не удалось получить данные пользователя');
    }

    // Ищем профиль по email или user_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .or(`email.eq.${email},user_id.eq.${data.user.id}`)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile lookup error:', profileError);
    }

    // Если профиль не найден, создаём новый
    let userProfile: UserProfile;
    if (!profile) {
      // Get referral code from user metadata
      const userReferralCode = data.user.user_metadata?.referral_code || 'GMQW2EGO';
      
      // Find referrer
      let referrerId: string | null = null;
      const { data: referrerData } = await supabase.functions.invoke('verify-referral', {
        body: { referralCode: userReferralCode },
      });
      if (referrerData?.referrer) {
        referrerId = referrerData.referrer.id;
      }

      // Генерируем уникальный telegram_id для email пользователей (отрицательный, чтобы не конфликтовать)
      const tempTelegramId = -Math.floor(Date.now() / 1000);
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          telegram_id: tempTelegramId,
          email: email,
          user_id: data.user.id,
          first_name: email.split('@')[0],
          referral_code: generateReferralCode(),
          referred_by: referrerId,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        throw new Error('Ошибка создания профиля');
      }

      userProfile = newProfile as UserProfile;

      // Создаём баланс и статистику для нового пользователя
      await supabase.from('balances').insert({
        user_id: userProfile.id,
        internal_balance: 0,
        external_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
      });

      await supabase.from('referral_stats').insert({
        user_id: userProfile.id,
        total_referrals: 0,
        total_earnings: 0,
        level_1_count: 0,
        level_2_count: 0,
        level_3_count: 0,
        level_4_count: 0,
        level_5_count: 0,
      });
    } else {
      userProfile = profile as UserProfile;
    }

    // Получаем баланс и статистику
    const { data: balance } = await supabase
      .from('balances')
      .select('*')
      .eq('user_id', userProfile.id)
      .maybeSingle();

    const { data: referralStats } = await supabase
      .from('referral_stats')
      .select('*')
      .eq('user_id', userProfile.id)
      .maybeSingle();

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userProfile.id)
      .maybeSingle();

    return {
      success: true,
      profile: userProfile,
      balance: balance as UserBalance | undefined,
      referralStats: referralStats as ReferralStats | undefined,
      role: userRole?.role || 'user',
    };
  } catch (error) {
    console.error('Email login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка входа',
    };
  }
};

/**
 * Получение профиля пользователя
 */
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as UserProfile | null;
};

/**
 * Обновление профиля пользователя
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> => {
  // Use edge function to bypass RLS for Telegram users
  const { data, error } = await supabase.functions.invoke('update-profile', {
    body: { profileId: userId, updates },
  });

  if (error || !data?.profile) {
    console.error('Error updating profile:', error);
    throw new Error('Ошибка обновления профиля');
  }

  return data.profile as UserProfile;
};

/**
 * Получение баланса пользователя
 */
export const getBalance = async (userId: string): Promise<UserBalance | null> => {
  const { data, error } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching balance:', error);
    return null;
  }

  return data as UserBalance | null;
};

/**
 * Получение статистики рефералов
 */
export const getReferralStats = async (userId: string): Promise<ReferralStats | null> => {
  const { data, error } = await supabase
    .from('referral_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching referral stats:', error);
    return null;
  }

  return data as ReferralStats | null;
};

/**
 * Получение рефералов пользователя
 */
export const getReferrals = async (userId: string) => {
  const { data, error } = await supabase
    .from('referrals')
    .select(`
      *,
      referred:profiles!referrals_referred_id_fkey(
        id,
        telegram_username,
        first_name,
        last_name,
        avatar_url,
        created_at
      )
    `)
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }

  return data || [];
};

/**
 * Получение VPN ключей пользователя
 */
export const getVPNKeys = async (userId: string) => {
  const { data, error } = await supabase
    .from('vpn_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching VPN keys:', error);
    return [];
  }

  return data || [];
};

/**
 * Получение подписок пользователя
 */
export const getSubscriptions = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }

  return data || [];
};

/**
 * Получение ботов пользователя
 */
export const getUserBots = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_bots')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user bots:', error);
    return [];
  }

  return data || [];
};

/**
 * Получение каналов пользователя
 */
export const getTelegramChannels = async (userId: string) => {
  const { data, error } = await supabase
    .from('telegram_channels')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching telegram channels:', error);
    return [];
  }

  return data || [];
};

/**
 * Проверка сессии Supabase Auth
 */
export const checkAuthSession = async () => {
  const { data: { session }, error } = await supabaseAuth.auth.getSession();
  
  if (error) {
    console.error('Session check error:', error);
    return null;
  }

  return session;
};

/**
 * Выход из системы
 */
export const signOut = async () => {
  const { error } = await supabaseAuth.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
  }
};
