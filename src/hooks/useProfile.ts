import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export const useProfile = () => {
  const { user: telegramUser, isTelegram } = useTelegramContext();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    if (!telegramUser?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch profile by telegram_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile not found - need to authenticate first
          setError('Профиль не найден. Необходима авторизация.');
        } else {
          throw profileError;
        }
        return;
      }

      setProfile(profileData);

      // Fetch balance
      const { data: balanceData } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', profileData.id)
        .single();

      if (balanceData) {
        setBalance({
          internal_balance: Number(balanceData.internal_balance) || 0,
          external_balance: Number(balanceData.external_balance) || 0,
          total_earned: Number(balanceData.total_earned) || 0,
          total_withdrawn: Number(balanceData.total_withdrawn) || 0,
        });
      }

      // Fetch referral stats
      const { data: referralData } = await supabase
        .from('referral_stats')
        .select('*')
        .eq('user_id', profileData.id)
        .single();

      if (referralData) {
        setReferralStats({
          total_referrals: referralData.total_referrals || 0,
          total_earnings: Number(referralData.total_earnings) || 0,
          level_1_count: referralData.level_1_count || 0,
          level_2_count: referralData.level_2_count || 0,
          level_3_count: referralData.level_3_count || 0,
          level_4_count: referralData.level_4_count || 0,
          level_5_count: referralData.level_5_count || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Ошибка загрузки профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: { first_name?: string; last_name?: string; avatar_url?: string }) => {
    if (!profile?.id) return false;

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (updateError) throw updateError;

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
    fetchProfileData();
  }, [telegramUser?.id]);

  const referralLink = profile?.referral_code 
    ? `https://t.me/YourBotUsername?start=${profile.referral_code}`
    : null;

  return {
    profile,
    balance,
    referralStats,
    referralLink,
    isLoading,
    error,
    updateProfile,
    refetch: fetchProfileData,
  };
};
