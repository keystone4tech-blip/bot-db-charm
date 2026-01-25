import { useCallback, useEffect, useState } from 'react';

import {
  type ExtendedUserProfile as ApiExtendedUserProfile,
  type ReferralStats,
  type Subscription,
  type TelegramChannel,
  type UserBalance,
  type UserBot,
  type VPNKey,
  getUserBalance,
  getUserBots,
  getUserChannels,
  getUserProfile,
  getUserReferralStats,
  getUserSubscriptions,
  getUserVPNKeys,
  updateUserProfile as apiUpdateUserProfile,
} from '@/lib/api';
import { useTelegramContext } from '@/components/TelegramProvider';

export type ExtendedUserProfile = ApiExtendedUserProfile;

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

const normalizeOptionalText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const normalizeProfile = (profile: ApiExtendedUserProfile): ApiExtendedUserProfile => {
  return {
    ...profile,
    city: normalizeOptionalText((profile as any).city),
    phone: normalizeOptionalText((profile as any).phone),
    email: normalizeOptionalText((profile as any).email),
    bio: normalizeOptionalText((profile as any).bio),
    link: normalizeOptionalText((profile as any).link),
  };
};

export const useProfile = (): ProfileHookReturn => {
  const {
    authProfile,
    authBalance,
    authReferralStats,
    isAuthenticated,
    user: telegramUser,
  } = useTelegramContext();

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

  useEffect(() => {
    let cancelled = false;

    const userId = authProfile?.id;

    const resetState = () => {
      setProfile(null);
      setBalance(null);
      setReferralStats(null);
      setVpnKey(null);
      setChannel(null);
      setUserBot(null);
      setSubscription(null);
      setReferralLink(null);
      setError(null);
      setIsLoading(false);
    };

    if (!isAuthenticated || !userId) {
      resetState();
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);
    setError(null);

    // Быстрый старт: используем данные из auth ответа (они уже с бэкенда),
    // а затем обновляем их из отдельных эндпоинтов.
    const now = new Date().toISOString();

    const initialProfile: ExtendedUserProfile = normalizeProfile({
      ...(authProfile as any),
      telegram_username: telegramUser?.username ?? (authProfile as any).telegram_username ?? null,
      first_name: telegramUser?.first_name ?? (authProfile as any).first_name ?? null,
      last_name: telegramUser?.last_name ?? (authProfile as any).last_name ?? null,
      avatar_url: telegramUser?.photo_url ?? (authProfile as any).avatar_url ?? null,
      referred_by: (authProfile as any).referred_by ?? null,
      created_at: (authProfile as any).created_at ?? now,
      updated_at: (authProfile as any).updated_at ?? now,
    });

    setProfile(initialProfile);

    if (authBalance) {
      setBalance({
        id: userId,
        user_id: userId,
        internal_balance: Number(authBalance.internal_balance ?? 0),
        external_balance: Number(authBalance.external_balance ?? 0),
        total_earned: Number(authBalance.total_earned ?? 0),
        total_withdrawn: Number(authBalance.total_withdrawn ?? 0),
        updated_at: now,
      });
    } else {
      setBalance(null);
    }

    if (authReferralStats) {
      setReferralStats({
        id: userId,
        user_id: userId,
        total_referrals: Number(authReferralStats.total_referrals ?? 0),
        total_earnings: Number(authReferralStats.total_earnings ?? 0),
        level_1_count: Number(authReferralStats.level_1_count ?? 0),
        level_2_count: Number(authReferralStats.level_2_count ?? 0),
        level_3_count: Number(authReferralStats.level_3_count ?? 0),
        level_4_count: Number(authReferralStats.level_4_count ?? 0),
        level_5_count: Number(authReferralStats.level_5_count ?? 0),
        updated_at: now,
      });
    } else {
      setReferralStats(null);
    }

    setReferralLink(initialProfile.referral_code ? `https://t.me/Keystone_Tech_Robot?start=${initialProfile.referral_code}` : null);

    setVpnKey(null);
    setChannel(null);
    setUserBot(null);
    setSubscription(null);

    const load = async () => {
      try {
        const [profileRes, balanceRes, referralRes] = await Promise.allSettled([
          getUserProfile(userId),
          getUserBalance(userId),
          getUserReferralStats(userId),
        ]);

        if (cancelled) return;

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          const nextProfile = normalizeProfile({
            ...profileRes.value,
            telegram_username: telegramUser?.username ?? profileRes.value.telegram_username,
            first_name: telegramUser?.first_name ?? profileRes.value.first_name,
            last_name: telegramUser?.last_name ?? profileRes.value.last_name,
            avatar_url: telegramUser?.photo_url ?? profileRes.value.avatar_url,
          });

          setProfile(nextProfile);
          setReferralLink(nextProfile.referral_code ? `https://t.me/Keystone_Tech_Robot?start=${nextProfile.referral_code}` : null);
        } else if (profileRes.status === 'rejected') {
          console.error('Ошибка загрузки профиля:', profileRes.reason);
        }

        if (balanceRes.status === 'fulfilled' && balanceRes.value) {
          setBalance(balanceRes.value);
        } else if (balanceRes.status === 'rejected') {
          console.error('Ошибка загрузки баланса:', balanceRes.reason);
        }

        if (referralRes.status === 'fulfilled' && referralRes.value) {
          setReferralStats(referralRes.value);
        } else if (referralRes.status === 'rejected') {
          console.error('Ошибка загрузки рефералов:', referralRes.reason);
        }

        const [vpnResponse, channelResponse, botResponse, subscriptionResponse] = await Promise.allSettled([
          getUserVPNKeys(userId),
          getUserChannels(userId),
          getUserBots(userId),
          getUserSubscriptions(userId),
        ]);

        if (cancelled) return;

        if (vpnResponse.status === 'fulfilled') {
          setVpnKey(vpnResponse.value?.[0] ?? null);
        } else {
          console.error('Ошибка при получении VPN ключей:', vpnResponse.reason);
          setVpnKey(null);
        }

        if (channelResponse.status === 'fulfilled') {
          setChannel(channelResponse.value?.[0] ?? null);
        } else {
          console.error('Ошибка при получении каналов:', channelResponse.reason);
          setChannel(null);
        }

        if (botResponse.status === 'fulfilled') {
          setUserBot(botResponse.value?.[0] ?? null);
        } else {
          console.error('Ошибка при получении ботов:', botResponse.reason);
          setUserBot(null);
        }

        if (subscriptionResponse.status === 'fulfilled') {
          setSubscription(subscriptionResponse.value?.[0] ?? null);
        } else {
          console.error('Ошибка при получении подписок:', subscriptionResponse.reason);
          setSubscription(null);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных профиля:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    authProfile?.id,
    authProfile?.referral_code,
    authBalance?.internal_balance,
    authBalance?.external_balance,
    authBalance?.total_earned,
    authBalance?.total_withdrawn,
    authReferralStats?.total_referrals,
    authReferralStats?.total_earnings,
    authReferralStats?.level_1_count,
    authReferralStats?.level_2_count,
    authReferralStats?.level_3_count,
    authReferralStats?.level_4_count,
    authReferralStats?.level_5_count,
    telegramUser?.username,
    telegramUser?.first_name,
    telegramUser?.last_name,
    telegramUser?.photo_url,
  ]);

  const updateProfile = useCallback(
    async (updates: Partial<ExtendedUserProfile>) => {
      if (!profile) return;

      const prev = profile;
      const optimistic = normalizeProfile({ ...profile, ...updates } as ApiExtendedUserProfile);

      setProfile(optimistic);

      try {
        const updated = await apiUpdateUserProfile(profile.id, updates);
        const normalized = normalizeProfile(updated);
        setProfile(normalized);
        setReferralLink(normalized.referral_code ? `https://t.me/Keystone_Tech_Robot?start=${normalized.referral_code}` : null);
      } catch (err) {
        setProfile(prev);
        setError(err instanceof Error ? err.message : 'Ошибка обновления профиля');
        throw err;
      }
    },
    [profile],
  );

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
  };
};
