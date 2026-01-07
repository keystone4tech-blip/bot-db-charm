import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { tg, isTelegramWebApp } from '@/lib/telegram';
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

    // Extract referral code from start_param
    const startParam = tg.initDataUnsafe?.start_param;
    const referralCode = startParam || null;

    console.log('Authenticating with Telegram...', { 
      hasInitData: !!initData, 
      referralCode,
      userId: tg.initDataUnsafe?.user?.id 
    });

    try {
      const { data, error } = await supabase.functions.invoke('telegram-auth', {
        body: { 
          initData,
          referralCode,
        },
      });

      if (error) {
        console.error('Auth function error:', error);
        throw new Error(error.message || 'Ошибка авторизации');
      }

      if (!data?.success) {
        console.error('Auth failed:', data?.error);
        throw new Error(data?.error || 'Авторизация не удалась');
      }

      console.log('Authentication successful:', data.profile?.id);

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        profile: data.profile,
        balance: data.balance,
        referralStats: data.referralStats,
        role: data.role || 'user',
      });

      // Show welcome message for new users
      if (referralCode && data.profile) {
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
