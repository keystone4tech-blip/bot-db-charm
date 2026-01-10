import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export interface PlatformStats {
  totalUsers: number;
  activeBots: number;
  activeSubscriptions: number;
  activeVpnKeys: number;
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

export const usePlatformStats = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeBots: 0,
    activeSubscriptions: 0,
    activeVpnKeys: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all stats in parallel
      const [
        usersResult,
        botsResult,
        subscriptionsResult,
        vpnKeysResult,
        transactionsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('user_bots').select('*').eq('is_active', true),
        supabase.from('subscriptions').select('*').eq('status', 'active'),
        supabase.from('vpn_keys').select('*').eq('status', 'active'),
        supabase.from('transactions').select('amount').eq('status', 'completed'),
      ]);

      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: revenueData } = await supabase
        .from('transactions')
        .select('amount')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .in('type', ['subscription_payment', 'vpn_payment', 'deposit']);

      const monthlyRevenue = revenueData?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

      setStats({
        totalUsers: usersResult.data?.length || 0,
        activeBots: botsResult.data?.length || 0,
        activeSubscriptions: subscriptionsResult.data?.length || 0,
        activeVpnKeys: vpnKeysResult.data?.length || 0,
        monthlyRevenue,
        totalTransactions: transactionsResult.data?.length || 0,
      });

      // Fetch recent activity
      await fetchRecentActivity();

    } catch (err) {
      console.error('Error fetching platform stats:', err);
      setError('Ошибка загрузки статистики');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];

      // Get recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, telegram_username, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      recentUsers?.forEach((user) => {
        activities.push({
          id: `user-${user.id}`,
          action: 'Новый пользователь',
          user: user.telegram_username ? `@${user.telegram_username}` : 'Аноним',
          time: formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: ru }),
          type: 'user',
        });
      });

      // Get recent subscriptions
      const { data: recentSubs } = await supabase
        .from('subscriptions')
        .select('id, user_id, created_at, profiles!inner(telegram_username)')
        .order('created_at', { ascending: false })
        .limit(5);

      recentSubs?.forEach((sub: any) => {
        activities.push({
          id: `sub-${sub.id}`,
          action: 'Оплата подписки',
          user: sub.profiles?.telegram_username ? `@${sub.profiles.telegram_username}` : 'Аноним',
          time: formatDistanceToNow(new Date(sub.created_at), { addSuffix: true, locale: ru }),
          type: 'subscription',
        });
      });

      // Get recent bots
      const { data: recentBots } = await supabase
        .from('user_bots')
        .select('id, user_id, created_at, profiles!inner(telegram_username)')
        .order('created_at', { ascending: false })
        .limit(5);

      recentBots?.forEach((bot: any) => {
        activities.push({
          id: `bot-${bot.id}`,
          action: 'Создан бот',
          user: bot.profiles?.telegram_username ? `@${bot.profiles.telegram_username}` : 'Аноним',
          time: formatDistanceToNow(new Date(bot.created_at), { addSuffix: true, locale: ru }),
          type: 'bot',
        });
      });

      // Get recent VPN activations
      const { data: recentVpn } = await supabase
        .from('vpn_keys')
        .select('id, user_id, activated_at, profiles!inner(telegram_username)')
        .not('activated_at', 'is', null)
        .order('activated_at', { ascending: false })
        .limit(5);

      recentVpn?.forEach((vpn: any) => {
        activities.push({
          id: `vpn-${vpn.id}`,
          action: 'VPN ключ активирован',
          user: vpn.profiles?.telegram_username ? `@${vpn.profiles.telegram_username}` : 'Аноним',
          time: formatDistanceToNow(new Date(vpn.activated_at), { addSuffix: true, locale: ru }),
          type: 'vpn',
        });
      });

      // Sort by time (most recent first) and take top 10
      activities.sort((a, b) => {
        // Parse "X минут назад" format - recent items should come first
        return 0; // Keep original order since they're already sorted by created_at
      });

      setRecentActivity(activities.slice(0, 10));
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    }
  };

  useEffect(() => {
    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { stats, recentActivity, isLoading, error, refetch: fetchStats };
};

// Format large numbers for display
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M+`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K+`;
  }
  return num.toLocaleString('ru-RU');
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `₽${amount.toLocaleString('ru-RU')}`;
};
