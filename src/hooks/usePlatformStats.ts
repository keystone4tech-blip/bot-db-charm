import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserActivity } from '@/hooks/useUserActivity';

export interface PlatformStats {
  totalUsers: number;
  activeBots: number;
  activeSubscriptions: number;
  activeVpnKeys: number;
  activeChannels: number;
  monthlyRevenue: number;
  totalTransactions: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
  type: 'user' | 'subscription' | 'bot' | 'vpn' | 'transaction';
}

export const usePlatformStats = (autoRefresh: boolean = false, refreshInterval: number = 30000, useSmartRefresh: boolean = true) => {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeBots: 0,
    activeSubscriptions: 0,
    activeVpnKeys: 0,
    activeChannels: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const isUserActive = useUserActivity();

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch counts from Supabase tables in parallel
      const [
        profilesRes,
        botsRes,
        subscriptionsRes,
        vpnKeysRes,
        channelsRes,
        transactionsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_bots').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('vpn_keys').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('telegram_channels').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: profilesRes.count || 0,
        activeBots: botsRes.count || 0,
        activeSubscriptions: subscriptionsRes.count || 0,
        activeVpnKeys: vpnKeysRes.count || 0,
        activeChannels: channelsRes.count || 0,
        monthlyRevenue: 0,
        totalTransactions: transactionsRes.count || 0,
      });

      // Fetch recent profiles as activity
      const { data: recentProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, telegram_username, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentProfiles) {
        const formatted: RecentActivity[] = recentProfiles.map((p) => ({
          id: p.id,
          action: 'Регистрация',
          user: p.first_name || p.telegram_username || 'Пользователь',
          time: p.created_at || '',
          type: 'user' as const,
        }));
        setRecentActivity(formatted);
      }
    } catch (err) {
      console.error('Error fetching platform stats:', err);
      setError('Ошибка загрузки статистики');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!autoRefresh || (useSmartRefresh && !isUserActive)) {
      return;
    }

    const id = setInterval(fetchStats, refreshInterval);
    setIntervalId(id);

    return () => {
      clearInterval(id);
      setIntervalId(null);
    };
  }, [autoRefresh, refreshInterval, isUserActive, useSmartRefresh, fetchStats]);

  return {
    stats,
    recentActivity,
    isLoading,
    error,
    isAutoRefreshing: !!intervalId,
    isUserActive
  };
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M+`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K+`;
  }
  return num.toLocaleString('ru-RU');
};

export const formatCurrency = (amount: number): string => {
  return `₽${amount.toLocaleString('ru-RU')}`;
};
