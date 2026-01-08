import { useState, useEffect, useCallback } from 'react';
// Используем API клиент для взаимодействия с Node.js сервером
import { getUserProfile, getUserBalance, getUserReferralStats } from '@/lib/api';
import { useTelegramContext } from '@/components/TelegramProvider';
import { toast } from 'sonner';

export interface ProfileData {
  id: string;
  telegram_id: number;
  telegram_username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  created_at: string | null;
}

export interface BalanceData {
  internal_balance: number;
  external_balance: number;
  total_earned: number;
  total_withdrawn: number;
}

export interface ReferralStatsData {
  total_referrals: number;
  total_earnings: number;
  level_1_count: number;
  level_2_count: number;
  level_3_count: number;
  level_4_count: number;
  level_5_count: number;
}

export interface VPNKeyData {
  id: string;
  status: string | null;
  expires_at: string | null;
  server_location: string;
}

export interface TelegramChannelData {
  id: string;
  channel_title: string;
  channel_username: string | null;
  subscribers_count: number | null;
  is_verified: boolean | null;
}

export interface UserBotData {
  id: string;
  bot_name: string;
  bot_username: string | null;
  bot_type: string;
  is_active: boolean | null;
  created_at: string | null;
}

export interface SubscriptionData {
  id: string;
  plan_name: string;
  plan_type: string;
  status: string | null;
  expires_at: string | null;
}

export const useProfile = () => {
  const { authProfile, authBalance, authReferralStats, isAuthenticated, isAuthLoading } = useTelegramContext();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStatsData | null>(null);
  const [vpnKey, setVpnKey] = useState<VPNKeyData | null>(null);
  const [channel, setChannel] = useState<TelegramChannelData | null>(null);
  const [userBot, setUserBot] = useState<UserBotData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    // Use authenticated profile from context
    if (!authProfile?.id) {
      setIsLoading(false);
      if (!isAuthLoading && !isAuthenticated) {
        setError('Необходима авторизация');
      }
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Set profile from auth context
      setProfile({
        id: authProfile.id,
        telegram_id: authProfile.telegram_id,
        telegram_username: authProfile.telegram_username,
        first_name: authProfile.first_name,
        last_name: authProfile.last_name,
        avatar_url: authProfile.avatar_url,
        referral_code: authProfile.referral_code,
        created_at: null,
      });

      // Set balance from auth context if available
      if (authBalance) {
        setBalance({
          internal_balance: authBalance.internal_balance || 0,
          external_balance: authBalance.external_balance || 0,
          total_earned: authBalance.total_earned || 0,
          total_withdrawn: authBalance.total_withdrawn || 0,
        });
      }

      // Set referral stats from auth context if available
      if (authReferralStats) {
        setReferralStats({
          total_referrals: authReferralStats.total_referrals || 0,
          total_earnings: authReferralStats.total_earnings || 0,
          level_1_count: authReferralStats.level_1_count || 0,
          level_2_count: authReferralStats.level_2_count || 0,
          level_3_count: authReferralStats.level_3_count || 0,
          level_4_count: authReferralStats.level_4_count || 0,
          level_5_count: authReferralStats.level_5_count || 0,
        });
      }

      // Fetch additional data not in auth context
      const [vpnRes, channelRes, botRes, subscriptionRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000'}/api/vpn-keys/${authProfile.id}`).then(r => r.json()),
        fetch(`${import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000'}/api/telegram-channels/${authProfile.id}`).then(r => r.json()),
        fetch(`${import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000'}/api/user-bots/${authProfile.id}`).then(r => r.json()),
        fetch(`${import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000'}/api/subscriptions/${authProfile.id}`).then(r => r.json()),
      ]);

      // Обрабатываем результаты
      const vpnData = vpnRes.vpnKeys?.[0] || null;
      const channelData = channelRes.channels?.[0] || null;
      const botData = botRes.bots?.[0] || null;
      const subscriptionData = subscriptionRes.subscriptions?.[0] || null;

      if (vpnData) {
        setVpnKey({
          id: vpnData.id,
          status: vpnData.status,
          expires_at: vpnData.expires_at,
          server_location: vpnData.server_location,
        });
      }

      if (channelData) {
        setChannel({
          id: channelData.id,
          channel_title: channelData.channel_title,
          channel_username: channelData.channel_username,
          subscribers_count: channelData.subscribers_count,
          is_verified: channelData.is_verified,
        });
      }

      if (botData) {
        setUserBot({
          id: botData.id,
          bot_name: botData.bot_name,
          bot_username: botData.bot_username,
          bot_type: botData.bot_type,
          is_active: botData.is_active,
          created_at: botData.created_at,
        });
      }

      if (subscriptionData) {
        setSubscription({
          id: subscriptionData.id,
          plan_name: subscriptionData.plan_name,
          plan_type: subscriptionData.plan_type,
          status: subscriptionData.status,
          expires_at: subscriptionData.expires_at,
        });
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Ошибка загрузки профиля');
    } finally {
      setIsLoading(false);
    }
  }, [authProfile, authBalance, authReferralStats, isAuthenticated, isAuthLoading]);

  const updateProfile = async (updates: { first_name?: string; last_name?: string; avatar_url?: string }) => {
    if (!profile?.id) return false;

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000'}/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();

      // Обновляем локальное состояние
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Профиль обновлён');
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Ошибка обновления профиля');
      return false;
    }
  };

  useEffect(() => {
    if (isAuthenticated && authProfile?.id) {
      fetchProfileData();
    } else if (!isAuthLoading && !isAuthenticated) {
      setIsLoading(false);
      setError('Необходима авторизация');
    }
  }, [isAuthenticated, authProfile?.id, isAuthLoading, fetchProfileData]);

  const referralLink = profile?.referral_code
    ? (() => {
        // Используем переменную окружения для имени бота
        // Так как Telegram WebApp не предоставляет напрямую имя бота
        const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
        
        // Если переменная окружения не установлена, используем placeholder
        const actualBotUsername = botUsername || 'YourBotUsername';
        
        return `https://t.me/${actualBotUsername}?start=${profile.referral_code}`;
      })()
    : null;


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
    updateProfile,
    refetch: fetchProfileData,
  };
};
