import { useState, useEffect, useCallback } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';

interface ProfileHookReturn {
  profile: UserProfile | null;
  balance: UserBalance | null;
  referralStats: ReferralStats | null;
  vpnKey: VPNKey | null;
  channel: TelegramChannel | null;
  userBot: UserBot | null;
  subscription: Subscription | null;
  referralLink: string | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useProfile = (): ProfileHookReturn => {
  const { authProfile, authBalance, authReferralStats, isAuthenticated } = useTelegramContext();
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
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
      // Преобразуем AuthProfile в UserProfile с дополнительными полями
      const fullProfile: UserProfile = {
        ...authProfile,
        referred_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(fullProfile);

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
  }, [isAuthenticated, authProfile, authBalance, authReferralStats]);

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

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      // Оптимистично обновляем профиль в UI
      const previousProfile = profile;
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      // В реальной реализации здесь будет вызов API для обновления профиля
      // await updateProfileApi(updates);

      // После успешного обновления инвалидируем кэш
      await queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    } catch (err) {
      // При ошибке откатываем изменения
      setProfile(previousProfile);
      setError(err instanceof Error ? err.message : 'Ошибка обновления профиля');
      throw err;
    }
  }, [profile, queryClient]);

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