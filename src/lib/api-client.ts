// Клиент для прямого взаимодействия с API и PostgreSQL базой данных
import { getReferralCode } from './telegram';

// Базовый URL для API
const API_BASE_URL = 'http://localhost:3000/api'; // В продакшене замените на URL вашего сервера

// Интерфейсы для данных
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

export interface UserBalance {
  id: string;
  user_id: string;
  internal_balance: number;
  external_balance: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: string;
}

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

export interface AuthResponse {
  success: boolean;
  profile?: UserProfile;
  balance?: UserBalance;
  referralStats?: ReferralStats;
  role?: string;
  error?: string;
}

// Функция аутентификации через Telegram
export const authenticateWithTelegram = async (initData: string, referralCode?: string): Promise<AuthResponse> => {
  try {
    // Используем базовый URL для API
    const response = await fetch(`${API_BASE_URL}/telegram-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initData,
        referralCode: referralCode || getReferralCode() || null
      }),
    });

    const data = await response.json();

    if (!response.ok) {
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
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
};

// Функция получения профиля пользователя
export const getUserProfile = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
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

// Функция обновления профиля пользователя
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Не удалось обновить профиль пользователя');
    }

    return await response.json() as UserProfile;
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    throw error;
  }
};

// Функция получения баланса пользователя
export const getUserBalance = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/balances/${userId}`, {
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

// Функция получения статистики по рефералам
export const getUserReferralStats = async (userId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/referral-stats/${userId}`, {
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