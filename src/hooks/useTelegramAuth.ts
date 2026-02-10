import { useState, useEffect, useCallback } from 'react';
import { authenticateTelegram, checkAuthSession, type UserProfile, type UserBalance, type ReferralStats } from '@/lib/supabase-api';
import { tg, isTelegramWebApp, getReferralCode } from '@/lib/telegram';
import { supabaseAuth } from '@/lib/supabaseAuth';
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

  // Set auth from any source (Telegram or Email)
  const setAuthenticated = useCallback((data: {
    profile: AuthProfile;
    balance?: AuthBalance | null;
    referralStats?: AuthReferralStats | null;
    role?: string;
  }) => {
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      profile: data.profile,
      balance: data.balance || null,
      referralStats: data.referralStats || null,
      role: data.role || 'user',
    });
  }, []);

  const authenticate = useCallback(async () => {
    // 1. Try Telegram auth first
    if (isTelegramWebApp()) {
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

      const startParam = tg.initDataUnsafe?.start_param;
      const urlReferralCode = getReferralCode();
      const referralCode = startParam || urlReferralCode || null;

      try {
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
          throw new Error(result.error || 'Авторизация не удалась');
        }

        setAuthenticated({
          profile: result.profile as AuthProfile,
          balance: result.balance as AuthBalance,
          referralStats: result.referralStats as AuthReferralStats,
          role: result.role || 'user',
        });

        if (referralCode && result.profile) {
          toast.success('Добро пожаловать! Вы зарегистрированы по реферальной ссылке');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка авторизации';
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        toast.error(errorMessage);
      }
      return;
    }

    // 2. Not in Telegram — check for existing Supabase session
    try {
      const session = await checkAuthSession();
      if (session?.user) {
        // We have a session, load profile directly by user_id
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profile) {
          // Use edge function to get full data (bypasses RLS for related tables)
          const { data: fullData } = await supabase.functions.invoke('user-profile-data', {
            body: { profileId: profile.id },
          });

          setAuthenticated({
            profile: (fullData?.profile || profile) as AuthProfile,
            balance: fullData?.balance as AuthBalance,
            referralStats: fullData?.referralStats as AuthReferralStats,
            role: 'user',
          });

          // Also fetch role
          if (fullData?.profile) {
            const { data: userRole } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.id)
              .maybeSingle();
            
            if (userRole) {
              setAuthenticated({
                profile: (fullData.profile || profile) as AuthProfile,
                balance: fullData.balance as AuthBalance,
                referralStats: fullData.referralStats as AuthReferralStats,
                role: userRole.role || 'user',
              });
            }
          }
          return;
        }
      }
    } catch (err) {
      console.log('No existing session:', err);
    }

    // No auth available — finish loading
    setAuthState(prev => ({
      ...prev,
      isLoading: false,
      error: null,
    }));
  }, [setAuthenticated]);

  useEffect(() => {
    if (isTelegramWebApp()) {
      tg.ready();
      const timer = setTimeout(() => {
        authenticate();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      authenticate();
    }
  }, [authenticate]);

  // Listen for Supabase auth state changes (email login/logout)
  useEffect(() => {
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && !authState.isAuthenticated) {
        // User just signed in via email — profile query uses RLS with auth.uid()
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .or(`email.eq.${session.user.email},user_id.eq.${session.user.id}`)
          .maybeSingle();

        if (profile) {
          // Use edge function for full data
          const { data: fullData } = await supabase.functions.invoke('user-profile-data', {
            body: { profileId: profile.id },
          });

          setAuthenticated({
            profile: (fullData?.profile || profile) as AuthProfile,
            balance: (fullData?.balance || null) as AuthBalance,
            referralStats: (fullData?.referralStats || null) as AuthReferralStats,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          profile: null,
          balance: null,
          referralStats: null,
          role: 'user',
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [authState.isAuthenticated, setAuthenticated]);

  return {
    ...authState,
    refetch: authenticate,
    setAuthenticated,
  };
};
