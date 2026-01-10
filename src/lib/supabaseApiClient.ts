import { getReferralCode } from './telegram';

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
 * Универсальный клиент для вызова Supabase функций
 */
const callSupabaseFunction = async (endpoint: string, method: string = 'GET', body?: any) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Не настроены переменные окружения для Supabase');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
    },
    ...(method !== 'GET' && body ? { body: JSON.stringify(body) } : {}),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || `HTTP error! status: ${response.status}`);
  }

  return result;
};

/**
 * Аутентификация пользователя через Telegram
 */
export const authenticateUser = async (initData: string, referralCode?: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting to authenticate user via Supabase function...');
    
    const result = await callSupabaseFunction('telegram-auth', 'POST', {
      initData,
      referralCode
    });

    console.log('Authentication result:', result);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Ошибка аутентификации'
      };
    }

    return {
      success: true,
      profile: result.profile as UserProfile,
      balance: result.balance as UserBalance,
      referralStats: result.referralStats as ReferralStats,
      role: result.role || 'user',
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка при аутентификации'
    };
  }
};

/**
 * Получение профиля пользователя
 */
export const getUserProfile = async (telegramId: number) => {
  try {
    return await callSupabaseFunction(`profiles/${telegramId}`, 'GET');
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Получение баланса пользователя
 */
export const getUserBalance = async (userId: string) => {
  try {
    return await callSupabaseFunction(`balances/${userId}`, 'GET');
  } catch (error) {
    console.error('Error getting user balance:', error);
    throw error;
  }
};

/**
 * Получение статистики по рефералам
 */
export const getUserReferralStats = async (userId: string) => {
  try {
    return await callSupabaseFunction(`referral-stats/${userId}`, 'GET');
  } catch (error) {
    console.error('Error getting referral stats:', error);
    throw error;
  }
};

/**
 * Получение VPN ключей пользователя
 */
export const getUserVPNKeys = async (userId: string) => {
  try {
    return await callSupabaseFunction(`vpn-keys/${userId}`, 'GET');
  } catch (error) {
    console.error('Error getting VPN keys:', error);
    throw error;
  }
};

/**
 * Получение телеграм каналов пользователя
 */
export const getUserChannels = async (userId: string) => {
  try {
    return await callSupabaseFunction(`telegram-channels/${userId}`, 'GET');
  } catch (error) {
    console.error('Error getting telegram channels:', error);
    throw error;
  }
};

/**
 * Получение ботов пользователя
 */
export const getUserBots = async (userId: string) => {
  try {
    return await callSupabaseFunction(`user-bots/${userId}`, 'GET');
  } catch (error) {
    console.error('Error getting user bots:', error);
    throw error;
  }
};

/**
 * Получение подписок пользователя
 */
export const getUserSubscriptions = async (userId: string) => {
  try {
    return await callSupabaseFunction(`subscriptions/${userId}`, 'GET');
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    throw error;
  }
};