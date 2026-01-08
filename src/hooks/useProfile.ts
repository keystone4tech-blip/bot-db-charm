import { useState, useEffect } from 'react';
import { 
  UserProfile, 
  UserBalance, 
  ReferralStats,
  VPNKey,
  TelegramChannel,
  UserBot,
  Subscription
} from '@/lib/api';
import { 
  getUserProfile, 
  getUserBalance, 
  getUserReferralStats 
} from '@/lib/api';
import { useTelegramContext } from '@/components/TelegramProvider';

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

interface VPNKey {
  id: string;
  user_id: string;
  status: string;
  expires_at: string;
  server_location: string;
  created_at: string;
  updated_at: string;
}

interface TelegramChannel {
  id: string;
  user_id: string;
  channel_title: string;
  channel_username: string;
  subscribers_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface UserBot {
  id: string;
  user_id: string;
  bot_name: string;
  bot_username: string;
  bot_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  plan_type: string;
  status: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = (): ProfileHookReturn => {
  const { authProfile, authBalance, authReferralStats, isAuthenticated } = useTelegramContext();
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
      setProfile(authProfile);
      setBalance(authBalance || null);
      setReferralStats(authReferralStats || null);
      
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

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      // В реальной реализации здесь будет вызов API для обновления профиля
      setProfile(prev => prev ? { ...prev, ...updates } : null);
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