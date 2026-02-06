import { useState, useEffect, useCallback } from 'react';
import { authenticateTelegram, updateProfile, type UserProfile, type UserBalance, type ReferralStats } from '@/lib/supabase-api';
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
      console.log('Not in Telegram WebApp environment - skipping auth');
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: null, // Don't show error for browser access
      }));
      return;
    }

    const telegramUser = tg.initDataUnsafe?.user;

    if (!telegramUser) {
      console.error('No Telegram user data available');
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
      userId: telegramUser.id,
      username: telegramUser.username,
      referralCode,
    });

    try {
      // Используем прямое подключение к Supabase
      const result = await authenticateTelegram(
        {
          id: telegramUser.id,
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          photo_url: telegramUser.photo_url,
        },
        referralCode
      );

      if (!result.success) {
        console.error('Auth failed:', result.error);
        throw new Error(result.error || 'Авторизация не удалась');
      }

      console.log('Authentication successful:', result.profile?.id);

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        profile: result.profile as AuthProfile,
        balance: result.balance as AuthBalance,
        referralStats: result.referralStats as AuthReferralStats,
        role: result.role || 'user',
      });

      // Show welcome message for new users with referral
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
      // Not in Telegram - just finish loading without setting error
      // This allows browser access to show the login/register screen
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: null, // No error - user can use email auth
      }));
    }
  }, [authenticate]);

  return {
    ...authState,
    refetch: authenticate,
  };
};
