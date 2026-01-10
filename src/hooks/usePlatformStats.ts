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

      // Call edge function that uses service role to bypass RLS
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/platform-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();

      if (data) {
        setStats(data.stats);
        
        // Format time for recent activity
        const formattedActivity: RecentActivity[] = data.recentActivity?.map((activity: any) => ({
          ...activity,
          time: formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ru }),
        })) || [];
        
        setRecentActivity(formattedActivity);
      }

    } catch (err) {
      console.error('Error fetching platform stats:', err);
      setError('Ошибка загрузки статистики');
    } finally {
      setIsLoading(false);
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
