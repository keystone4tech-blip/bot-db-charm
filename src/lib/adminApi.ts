import { UserProfile, UserBalance, ReferralStats } from './api';

/**
 * Интерфейс для статистики администратора
 */
export interface AdminStats {
  totalUsers: number;
  activeBots: number;
  activeSubscriptions: number;
  activeVPNKeys: number;
  monthlyRevenue: number;
  activityRate: number;
}

/**
 * Интерфейс для пользователя в админ-панели
 */
export interface AdminUser {
  id: string;
  telegram_id: number;
  telegram_username: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  status: 'active' | 'banned';
  balance: number;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Интерфейс для бота в админ-панели
 */
export interface AdminBot {
  id: string;
  name: string;
  username: string;
  isActive: boolean;
  usersCount: number;
  messagesCount: number;
  type: string;
  createdAt: string;
}

/**
 * Получение общей статистики для администратора
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${serverBaseUrl}/api/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}` // Предполагаем, что админ-токен хранится в localStorage
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось получить статистику администратора');
    }

    return await response.json() as AdminStats;
  } catch (error) {
    console.error('Ошибка получения статистики администратора:', error);
    throw error;
  }
};

/**
 * Получение списка пользователей для администратора
 */
export const getAdminUsers = async (page: number = 1, limit: number = 20): Promise<{ users: AdminUser[], total: number }> => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${serverBaseUrl}/api/admin/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось получить список пользователей');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка получения списка пользователей:', error);
    throw error;
  }
};

/**
 * Получение списка ботов для администратора
 */
export const getAdminBots = async (): Promise<AdminBot[]> => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${serverBaseUrl}/api/admin/bots`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось получить список ботов');
    }

    return await response.json() as AdminBot[];
  } catch (error) {
    console.error('Ошибка получения списка ботов:', error);
    throw error;
  }
};

/**
 * Получение информации о пользователе для администратора
 */
export const getAdminUserInfo = async (userId: string): Promise<{
  profile: UserProfile;
  balance: UserBalance;
  referralStats: ReferralStats;
  subscriptions: any[];
  vpnKeys: any[];
}> => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${serverBaseUrl}/api/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось получить информацию о пользователе');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка получения информации о пользователе:', error);
    throw error;
  }
};

/**
 * Получение общей статистики для администратора
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${serverBaseUrl}/api/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось получить статистику администратора');
    }

    return await response.json() as AdminStats;
  } catch (error) {
    console.error('Ошибка получения статистики администратора:', error);
    throw error;
  }
};

/**
 * Получение списка пользователей для администратора
 */
export const getAdminUsers = async (page: number = 1, limit: number = 20): Promise<{ users: AdminUser[], total: number }> => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${serverBaseUrl}/api/admin/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось получить список пользователей');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка получения списка пользователей:', error);
    throw error;
  }
};

/**
 * Получение списка ботов для администратора
 */
export const getAdminBots = async (): Promise<AdminBot[]> => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${serverBaseUrl}/api/admin/bots`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось получить список ботов');
    }

    return await response.json() as AdminBot[];
  } catch (error) {
    console.error('Ошибка получения списка ботов:', error);
    throw error;
  }
};

/**
 * Получение информации о пользователе для администратора
 */
export const getAdminUserInfo = async (userId: string): Promise<{
  profile: UserProfile;
  balance: UserBalance;
  referralStats: ReferralStats;
  subscriptions: any[];
  vpnKeys: any[];
}> => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${serverBaseUrl}/api/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось получить информацию о пользователе');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка получения информации о пользователе:', error);
    throw error;
  }
};

/**
 * Проверка, является ли пользователь администратором
 */
export const checkAdminAccess = async (telegramId: number): Promise<boolean> => {
  try {
    const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${serverBaseUrl}/api/admin/check-access?telegramId=${telegramId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isAdmin || false;
  } catch (error) {
    console.error('Ошибка проверки прав администратора:', error);
    return false;
  }
};