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

      // Call platform-stats edge function which uses service role (bypasses RLS)
      const { data, error: fnError } = await supabase.functions.invoke('platform-stats');

      if (fnError) {
        throw fnError;
      }

      if (data?.stats) {
        setStats({
          totalUsers: data.stats.totalUsers || 0,
          activeBots: data.stats.activeBots || 0,
          activeSubscriptions: data.stats.activeSubscriptions || 0,
          activeVpnKeys: data.stats.activeVpnKeys || 0,
          activeChannels: 0,
          monthlyRevenue: data.stats.monthlyRevenue || 0,
          totalTransactions: data.stats.totalTransactions || 0,
        });
      }

      if (data?.recentActivity) {
        const formatted: RecentActivity[] = data.recentActivity.map((a: any) => ({
          id: a.id,
          action: a.action,
          user: a.user,
          time: a.created_at || '',
          type: a.type as RecentActivity['type'],
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
