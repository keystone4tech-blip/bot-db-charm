import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Bot,
  CreditCard,
  TrendingUp,
  Shield,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { getAdminStats } from '@/lib/adminApi';
import { Loader2 } from 'lucide-react';

export const AdminStatsView = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки статистики');
        console.error('Ошибка загрузки статистики:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = stats ? [
    { label: 'Всего пользователей', value: stats.totalUsers.toLocaleString(), icon: Users, trend: '+12%', color: 'text-blue-500' },
    { label: 'Активные боты', value: stats.activeBots.toString(), icon: Bot, trend: '+5%', color: 'text-green-500' },
    { label: 'Подписки', value: stats.activeSubscriptions.toString(), icon: CreditCard, trend: '+8%', color: 'text-primary' },
    { label: 'VPN ключи', value: stats.activeVPNKeys.toString(), icon: Shield, trend: '+15%', color: 'text-purple-500' },
    { label: 'Доход за месяц', value: `₽${stats.monthlyRevenue.toLocaleString()}`, icon: TrendingUp, trend: '+23%', color: 'text-emerald-500' },
    { label: 'Активность', value: `${stats.activityRate}%`, icon: Activity, trend: '+2%', color: 'text-orange-500' },
  ] : [];

  if (isLoading) {
    return (
      <div className="px-4 pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4"
          >
            <Loader2 className="w-8 h-8 text-primary" />
          </motion.div>
          <p className="text-muted-foreground">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-destructive mb-2">Ошибка загрузки статистики</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24">
      <PageHeader
        icon="bar-chart-3"
        title="Статистика"
        subtitle="Общая аналитика платформы"
      />

      <div className="grid grid-cols-2 gap-3 mt-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/70 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-xs text-green-500 font-medium">{stat.trend}</span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Последняя активность
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { action: 'Новый пользователь', user: '@username1', time: '2 мин назад' },
              { action: 'Оплата подписки', user: '@username2', time: '5 мин назад' },
              { action: 'Создан бот', user: '@username3', time: '10 мин назад' },
              { action: 'VPN ключ активирован', user: '@username4', time: '15 мин назад' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
