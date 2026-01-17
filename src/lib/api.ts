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
 * Интерфейс для расширенного профиля пользователя
 */
export interface ExtendedUserProfile extends UserProfile {
  city?: string;
  phone?: string;
  email?: string;
  bio?: string;
  link?: string;
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
  is_trial: boolean | null;
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
  profile?: ExtendedUserProfile;
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

    // Проверяем, является ли ответ валидным JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response received:', responseText);
      throw new Error('Сервер вернул некорректный ответ. Пожалуйста, проверьте конфигурацию сервера.');
    }

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
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || '/';
    const apiUrl = serverBaseUrl === '/' ? `/api/profiles/${telegramId}` : `${serverBaseUrl}/api/profiles/${telegramId}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось получить профиль пользователя');
    }

    return await response.json() as UserProfile;
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
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || '/';
    const apiUrl = serverBaseUrl === '/' ? `/api/balances/${userId}` : `${serverBaseUrl}/api/balances/${userId}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось получить баланс пользователя');
    }

    return await response.json() as UserBalance;
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
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || '/';
    const apiUrl = serverBaseUrl === '/' ? `/api/referral-stats/${userId}` : `${serverBaseUrl}/api/referral-stats/${userId}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось получить статистику рефералов');
    }

    return await response.json() as ReferralStats;
  } catch (error) {
    console.error('Ошибка получения статистики рефералов:', error);
    throw error;
  }
};

/**
 * Создание VPN ключа
 */
export const createVPNKey = async (keyData: any) => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || '/';
    const apiUrl = serverBaseUrl === '/' ? `/api/vpn-keys` : `${serverBaseUrl}/api/vpn-keys`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(keyData),
    });

    if (!response.ok) {
      throw new Error('Не удалось создать VPN ключ');
    }

    const data = await response.json();
    return data.vpnKey as any;
  } catch (error) {
    console.error('Ошибка создания VPN ключа:', error);
    throw error;
  }
};

/**
 * Получение VPN ключей пользователя
 */
export const getUserVPNKeys = async (userId: string) => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || '/';
    const apiUrl = serverBaseUrl === '/' ? `/api/vpn-keys/${userId}` : `${serverBaseUrl}/api/vpn-keys/${userId}`;

    const response = await fetch(apiUrl, {
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
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || '/';
    const apiUrl = serverBaseUrl === '/' ? `/api/telegram-channels/${userId}` : `${serverBaseUrl}/api/telegram-channels/${userId}`;

    const response = await fetch(apiUrl, {
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
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || '/';
    const apiUrl = serverBaseUrl === '/' ? `/api/user-bots/${userId}` : `${serverBaseUrl}/api/user-bots/${userId}`;

    const response = await fetch(apiUrl, {
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
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || '/';
    const apiUrl = serverBaseUrl === '/' ? `/api/subscriptions/${userId}` : `${serverBaseUrl}/api/subscriptions/${userId}`;

    const response = await fetch(apiUrl, {
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
  } catch (error) {
    console.error('Ошибка получения подписок пользователя:', error);
    throw error;
  }
};

/**
 * Обновление профиля пользователя
 */
export const updateUserProfile = async (userId: string, updates: Partial<ExtendedUserProfile>) => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || '/';
    const apiUrl = serverBaseUrl === '/' ? `/api/profiles/${userId}` : `${serverBaseUrl}/api/profiles/${userId}`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Не удалось обновить профиль пользователя');
    }

    return await response.json() as ExtendedUserProfile;
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    throw error;
  }
};

/**
 * Инициация аутентификации по Telegram ID или никнейму
 */
export const initiateAuth = async (telegramId?: number, telegramUsername?: string) => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || '/';
    const apiUrl = serverBaseUrl === '/' ? `/api/initiate-auth` : `${serverBaseUrl}/api/initiate-auth`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegramId,
        telegramUsername
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Возвращаем данные даже если статус не OK, чтобы обработать userNotFound
      return data;
    }

    return data;
  } catch (error) {
    console.error('Ошибка инициации аутентификации:', error);
    throw error;
  }
};

/**
 * Проверка аутентификационного кода
 */
export const verifyAuthCode = async (authCode: string) => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || '/';
    const apiUrl = serverBaseUrl === '/' ? `/api/verify-auth-code` : `${serverBaseUrl}/api/verify-auth-code`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ authCode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Неверный или просроченный код');
    }

    return await response.json() as AuthResponse;
  } catch (error) {
    console.error('Ошибка проверки аутентификационного кода:', error);
    throw error;
  }
};