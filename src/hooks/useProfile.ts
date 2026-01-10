import { useState, useEffect } from 'react';
import {
  UserProfile,
  UserBalance,
  ReferralStats,
  VPNKey,
  TelegramChannel,
  UserBot,
  Subscription,
  getUserVPNKeys,
  getUserChannels,
  getUserBots,
  getUserSubscriptions
} from '@/lib/api';
import { useTelegramContext } from '@/components/TelegramProvider';

// Расширяем интерфейс профиля дополнительными полями
export interface ExtendedUserProfile extends UserProfile {
  city?: string;
  phone?: string;
  email?: string;
  bio?: string;
  link?: string;
}

interface ProfileHookReturn {
  profile: ExtendedUserProfile | null;
  balance: UserBalance | null;
  referralStats: ReferralStats | null;
  vpnKey: VPNKey | null;
  channel: TelegramChannel | null;
  userBot: UserBot | null;
  subscription: Subscription | null;
  referralLink: string | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<ExtendedUserProfile>) => Promise<void>;
}

export const useProfile = (): ProfileHookReturn => {
  const { authProfile, authBalance, authReferralStats, isAuthenticated, user: telegramUser } = useTelegramContext();
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [vpnKey, setVpnKey] = useState<VPNKey | null>(null);
  const [channel, setChannel] = useState<TelegramChannel | null>(null);
  const [userBot, setUserBot] = useState<UserBot | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем данные при изменении аутентификации
  useEffect(() => {
    if (isAuthenticated && authProfile) {
      // Проверяем, изменились ли данные Telegram и обновляем их в базе
      const hasChanged =
        authProfile.first_name !== telegramUser?.first_name ||
        authProfile.last_name !== telegramUser?.last_name ||
        authProfile.telegram_username !== telegramUser?.username ||
        authProfile.avatar_url !== telegramUser?.photo_url;

      // Загружаем расширенные данные профиля из базы данных (в реальной реализации)
      // Для демонстрации используем заглушку
      const extendedData = {
        city: '', // В реальной реализации загружать из базы данных
        phone: '', // В реальной реализации загружать из базы данных
        email: '', // В реальной реализации загружать из базы данных
        bio: '', // В реальной реализации загружать из базы данных
        link: '', // В реальной реализации загружать из базы данных
      };

      if (hasChanged) {
        // Обновляем профиль с новыми данными из Telegram
        const updatedProfile: ExtendedUserProfile = {
          ...authProfile,
          first_name: telegramUser?.first_name || authProfile.first_name,
          last_name: telegramUser?.last_name || authProfile.last_name,
          telegram_username: telegramUser?.username || authProfile.telegram_username,
          avatar_url: telegramUser?.photo_url || authProfile.avatar_url,
          referred_by: authProfile.referred_by,
          created_at: authProfile.created_at,
          updated_at: new Date().toISOString(),
          ...extendedData // Добавляем расширенные данные
        };

        // Здесь в реальной реализации нужно вызвать API для обновления данных в базе
        // updateProfileInDatabase(updatedProfile);
        setProfile(updatedProfile);
      } else {
        // Преобразуем AuthProfile в ExtendedUserProfile с дополнительными полями
        const fullProfile: ExtendedUserProfile = {
          ...authProfile,
          referred_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...extendedData // Добавляем расширенные данные
        };
        setProfile(fullProfile);
      }

      // Преобразуем AuthBalance в UserBalance
      if (authBalance) {
        const fullBalance: UserBalance = {
          id: authProfile.id,
          user_id: authProfile.id,
          ...authBalance,
          updated_at: new Date().toISOString(),
        };
        setBalance(fullBalance);
      }

      // Преобразуем AuthReferralStats в ReferralStats
      if (authReferralStats) {
        const fullReferralStats: ReferralStats = {
          id: authProfile.id,
          user_id: authProfile.id,
          ...authReferralStats,
          updated_at: new Date().toISOString(),
        };
        setReferralStats(fullReferralStats);
      }

      // Генерируем реферальную ссылку
      if (authProfile.referral_code) {
        setReferralLink(`https://t.me/Keystone_Tech_bot?start=${authProfile.referral_code}`);
      }

      // Загружаем дополнительные данные
      loadAdditionalData(authProfile.id);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, authProfile, authBalance, authReferralStats, telegramUser]);

  const loadAdditionalData = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Загружаем дополнительные данные параллельно
      const [vpnResponse, channelResponse, botResponse, subscriptionResponse] = await Promise.allSettled([
        getUserVPNKeys(userId),
        getUserChannels(userId),
        getUserBots(userId),
        getUserSubscriptions(userId)
      ]);

      if (vpnResponse.status === 'fulfilled' && vpnResponse.value?.length > 0) {
        setVpnKey(vpnResponse.value[0]);
      }

      if (channelResponse.status === 'fulfilled' && channelResponse.value?.length > 0) {
        setChannel(channelResponse.value[0]);
      }

      if (botResponse.status === 'fulfilled' && botResponse.value?.length > 0) {
        setUserBot(botResponse.value[0]);
      }

      if (subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value?.length > 0) {
        setSubscription(subscriptionResponse.value[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ExtendedUserProfile>) => {
    try {
      // В реальной реализации здесь будет вызов API для обновления профиля
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      // Если профиль существует, обновляем его в базе данных
      if (profile) {
        try {
          await updateUserProfile(profile.id, updates);
        } catch (apiError) {
          console.error('Ошибка обновления профиля в базе данных:', apiError);
          // Возвращаем предыдущее состояние в случае ошибки
          setProfile(prev => prev ? { ...prev, ...Object.keys(updates).reduce((acc, key) => {
            acc[key as keyof ExtendedUserProfile] = prev[key as keyof ExtendedUserProfile];
            return acc;
          }, {} as Partial<ExtendedUserProfile>) } : null);
          throw apiError;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления профиля');
      throw err;
    }
  };

  return {
    profile,
    balance,
    referralStats,
    vpnKey,
    channel,
    userBot,
    subscription,
    referralLink,
    isLoading,
    error,
    updateProfile
  };
};