import { useState, useEffect, useCallback } from 'react';
import { authenticateUser, updateUserProfile } from '@/lib/api';
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

      // Проверяем, изменились ли данные Telegram и обновляем их в базе
      const hasChanged =
        result.profile?.first_name !== tg.initDataUnsafe?.user?.first_name ||
        result.profile?.last_name !== tg.initDataUnsafe?.user?.last_name ||
        result.profile?.telegram_username !== tg.initDataUnsafe?.user?.username ||
        result.profile?.avatar_url !== tg.initDataUnsafe?.user?.photo_url;

      let updatedProfile = result.profile;

      if (hasChanged) {
        // Подготавливаем обновленные данные профиля
        updatedProfile = {
          ...result.profile,
          first_name: tg.initDataUnsafe?.user?.first_name || result.profile?.first_name,
          last_name: tg.initDataUnsafe?.user?.last_name || result.profile?.last_name,
          telegram_username: tg.initDataUnsafe?.user?.username || result.profile?.telegram_username,
          avatar_url: tg.initDataUnsafe?.user?.photo_url || result.profile?.avatar_url,
        };

        // Обновляем данные в базе
        try {
          await updateUserProfile(updatedProfile.id, {
            first_name: updatedProfile.first_name,
            last_name: updatedProfile.last_name,
            telegram_username: updatedProfile.telegram_username,
            avatar_url: updatedProfile.avatar_url,
          });
        } catch (updateError) {
          console.error('Ошибка обновления профиля в базе данных:', updateError);
          // В случае ошибки используем старые данные
          updatedProfile = result.profile;
        }
      }

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        profile: updatedProfile,
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
      // Для мобильных устройств и других случаев, когда не в Telegram,
      // устанавливаем фиктивные данные для тестирования
      // Это позволяет приложению работать не только в разработке, но и на мобильных устройствах
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        profile: {
          id: 'mobile-profile-id',
          telegram_id: 123456789,
          telegram_username: 'mobile_test_user',
          first_name: 'Mobile Test',
          last_name: 'User',
          avatar_url: null,
          referral_code: 'MOBILE1'
        },
        balance: {
          internal_balance: 1000,
          external_balance: 500,
          total_earned: 1500,
          total_withdrawn: 0
        },
        referralStats: {
          total_referrals: 5,
          total_earnings: 250,
          level_1_count: 3,
          level_2_count: 1,
          level_3_count: 1,
          level_4_count: 0,
          level_5_count: 0
        },
        role: 'user',
      });
    }
  }, [authenticate]);

  return {
    ...authState,
    refetch: authenticate,
  };
};
