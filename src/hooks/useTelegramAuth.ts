import { useState, useEffect, useCallback } from 'react';
import { authenticateUser } from '@/lib/api';
import { tg, isTelegramWebApp, getReferralCode } from '@/lib/telegram';
import { toast } from 'sonner';

export interface AuthProfile {
  id: string;
  telegram_id: number;
  telegram_username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  referral_code: string | null;
}

export interface AuthBalance {
  internal_balance: number;
  external_balance: number;
  total_earned: number;
  total_withdrawn: number;
}

export interface AuthReferralStats {
  total_referrals: number;
  total_earnings: number;
  level_1_count: number;
  level_2_count: number;
  level_3_count: number;
  level_4_count: number;
  level_5_count: number;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  profile: AuthProfile | null;
  balance: AuthBalance | null;
  referralStats: AuthReferralStats | null;
  role: string;
}

export const useTelegramAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    profile: null,
    balance: null,
    referralStats: null,
    role: 'user',
  });

  const authenticate = useCallback(async () => {
    if (!isTelegramWebApp()) {
      console.log('Not in Telegram WebApp environment');
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Приложение доступно только через Telegram',
      }));
      return;
    }

    const initData = tg.initData;

    if (!initData) {
      console.error('No initData available');
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Не удалось получить данные Telegram',
      }));
      return;
    }

    // Extract referral code from multiple sources
    const startParam = tg.initDataUnsafe?.start_param;
    const urlReferralCode = getReferralCode();
    const referralCode = startParam || urlReferralCode || null;

    console.log('Authenticating with Telegram...', {
      hasInitData: !!initData,
      referralCode,
      userId: tg.initDataUnsafe?.user?.id
    });

    try {
      // Используем наш новый API клиент для аутентификации
      const result = await authenticateUser(initData, referralCode);

      if (!result.success) {
        console.error('Auth failed:', result.error);
        throw new Error(result.error || 'Авторизация не удалась');
      }

      console.log('Authentication successful:', result.profile?.id);

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        profile: result.profile,
        balance: result.balance,
        referralStats: result.referralStats,
        role: result.role || 'user',
      });

      // Show welcome message for new users
      if (referralCode && result.profile) {
        toast.success('Добро пожаловать! Вы зарегистрированы по реферальной ссылке');
      }

    } catch (err) {
      console.error('Authentication error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка авторизации';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, []);

  useEffect(() => {
    // Wait for Telegram WebApp to be ready
    if (isTelegramWebApp()) {
      tg.ready();
      // Small delay to ensure initData is available
      const timer = setTimeout(() => {
        authenticate();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Откройте приложение через Telegram бота',
      }));
    }
  }, [authenticate]);

  return {
    ...authState,
    refetch: authenticate,
  };
};
