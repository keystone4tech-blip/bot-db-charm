/**
 * API клиент для взаимодействия с нашим бэкенд-сервером
 */

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
 * Аутентификация пользователя через Telegram
 */
export const authenticateUser = async (initData: string, referralCode?: string): Promise<AuthResponse> => {
  try {
    // Проверяем, какую систему использовать на основе переменных окружения
    const useSupabase = import.meta.env.USE_SUPABASE === 'true';

    if (useSupabase) {
      // Используем Supabase функции
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Не настроены переменные окружения для Supabase');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/telegram-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          initData,
          referralCode: referralCode || getReferralCode() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Ошибка аутентификации'
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Ошибка аутентификации'
        };
      }

      return {
        success: true,
        profile: data.profile as UserProfile,
        balance: data.balance as UserBalance,
        referralStats: data.referralStats as ReferralStats,
        role: data.role || 'user',
      };
    } else {
      // Используем локальный сервер
      const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${serverBaseUrl}/api/telegram-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData,
          referralCode: referralCode || getReferralCode() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Ошибка аутентификации'
        };
      }

      return data;
    }
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка при аутентификации'
    };
  }
};

/**
 * Получение профиля пользователя по Telegram ID
 */
export const getUserProfile = async (telegramId: number) => {
  try {
    const useSupabase = import.meta.env.USE_SUPABASE === 'true';

    if (useSupabase) {
      // Используем Supabase функцию
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Не настроены переменные окружения для Supabase');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/user-profile/${telegramId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось получить профиль пользователя');
      }

      return data.profile as UserProfile;
    } else {
      // Используем локальный сервер
      const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${serverBaseUrl}/api/profiles/${telegramId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось получить профиль пользователя');
      }

      return await response.json() as UserProfile;
    }
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    throw error;
  }
};

/**
 * Получение баланса пользователя
 */
export const getUserBalance = async (userId: string) => {
  try {
    const useSupabase = import.meta.env.USE_SUPABASE === 'true';

    if (useSupabase) {
      // Используем Supabase функцию
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Не настроены переменные окружения для Supabase');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/user-balance/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось получить баланс пользователя');
      }

      return data.balance as UserBalance;
    } else {
      // Используем локальный сервер
      const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${serverBaseUrl}/api/balances/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось получить баланс пользователя');
      }

      return await response.json() as UserBalance;
    }
  } catch (error) {
    console.error('Ошибка получения баланса:', error);
    throw error;
  }
};

/**
 * Получение статистики по рефералам
 */
export const getUserReferralStats = async (userId: string) => {
  try {
    const useSupabase = import.meta.env.USE_SUPABASE === 'true';

    if (useSupabase) {
      // Используем Supabase функцию
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Не настроены переменные окружения для Supabase');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/referral-stats/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось получить статистику рефералов');
      }

      return data.stats as ReferralStats;
    } else {
      // Используем локальный сервер
      const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${serverBaseUrl}/api/referral-stats/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось получить статистику рефералов');
      }

      return await response.json() as ReferralStats;
    }
  } catch (error) {
    console.error('Ошибка получения статистики рефералов:', error);
    throw error;
  }
};

/**
 * Получение VPN ключей пользователя
 */
export const getUserVPNKeys = async (userId: string) => {
  try {
    const useSupabase = import.meta.env.USE_SUPABASE === 'true';

    if (useSupabase) {
      // Используем Supabase функцию
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Не настроены переменные окружения для Supabase');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/vpn-keys/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось получить VPN ключи');
      }

      return data.vpnKeys as any[];
    } else {
      // Используем локальный сервер
      const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${serverBaseUrl}/api/vpn-keys/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось получить VPN ключи');
      }

      const data = await response.json();
      return data.vpnKeys as any[];
    }
  } catch (error) {
    console.error('Ошибка получения VPN ключей:', error);
    throw error;
  }
};

/**
 * Получение телеграм каналов пользователя
 */
export const getUserChannels = async (userId: string) => {
  try {
    const useSupabase = import.meta.env.USE_SUPABASE === 'true';

    if (useSupabase) {
      // Используем Supabase функцию
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Не настроены переменные окружения для Supabase');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/telegram-channels/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось получить телеграм каналы');
      }

      return data.channels as any[];
    } else {
      // Используем локальный сервер
      const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${serverBaseUrl}/api/telegram-channels/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось получить телеграм каналы');
      }

      const data = await response.json();
      return data.channels as any[];
    }
  } catch (error) {
    console.error('Ошибка получения телеграм каналов:', error);
    throw error;
  }
};

/**
 * Получение ботов пользователя
 */
export const getUserBots = async (userId: string) => {
  try {
    const useSupabase = import.meta.env.USE_SUPABASE === 'true';

    if (useSupabase) {
      // Используем Supabase функцию
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Не настроены переменные окружения для Supabase');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/user-bots/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось получить ботов пользователя');
      }

      return data.bots as any[];
    } else {
      // Используем локальный сервер
      const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${serverBaseUrl}/api/user-bots/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось получить ботов пользователя');
      }

      const data = await response.json();
      return data.bots as any[];
    }
  } catch (error) {
    console.error('Ошибка получения ботов пользователя:', error);
    throw error;
  }
};

/**
 * Получение подписок пользователя
 */
export const getUserSubscriptions = async (userId: string) => {
  try {
    const useSupabase = import.meta.env.USE_SUPABASE === 'true';

    if (useSupabase) {
      // Используем Supabase функцию
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Не настроены переменные окружения для Supabase');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/subscriptions/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось получить подписки пользователя');
      }

      return data.subscriptions as any[];
    } else {
      // Используем локальный сервер
      const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${serverBaseUrl}/api/subscriptions/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Не удалось получить подписки пользователя');
      }

      const data = await response.json();
      return data.subscriptions as any[];
    }
  } catch (error) {
    console.error('Ошибка получения подписок пользователя:', error);
    throw error;
  }
};