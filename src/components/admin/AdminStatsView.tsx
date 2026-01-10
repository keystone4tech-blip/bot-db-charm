import { motion } from 'framer-motion';
import {
  Users,
  Bot,
  CreditCard,
  TrendingUp,
  Shield,
  Activity,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePlatformStats, formatNumber, formatCurrency } from '@/hooks/usePlatformStats';

export const AdminStatsView = () => {
  const { stats, recentActivity, isLoading, error, isUserActive } = usePlatformStats(false, 30000, true); // Disable auto-refresh, enable smart refresh

  const statsData = [
    { label: 'Всего пользователей', value: formatNumber(stats.totalUsers), icon: Users, color: 'text-blue-500' },
    { label: 'Активные боты', value: formatNumber(stats.activeBots), icon: Bot, color: 'text-green-500' },
    { label: 'Подписки', value: formatNumber(stats.activeSubscriptions), icon: CreditCard, color: 'text-primary' },
    { label: 'VPN ключи', value: formatNumber(stats.activeVpnKeys), icon: Shield, color: 'text-purple-500' },
    { label: 'Доход за месяц', value: formatCurrency(stats.monthlyRevenue), icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Транзакций', value: formatNumber(stats.totalTransactions), icon: Activity, color: 'text-orange-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pb-24">
        <PageHeader
          icon="bar-chart-3"
          title="Статистика"
          subtitle="Ошибка загрузки данных"
        />
        <p className="text-destructive text-center mt-8">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24">
      <div className="flex justify-between items-center">
        <PageHeader
          icon="bar-chart-3"
          title="Статистика"
          subtitle="Общая аналитика платформы"
        />
        <div className="text-xs text-muted-foreground">
          {isUserActive ? 'Активен' : 'Неактивен'}
        </div>
      </div>

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
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Нет недавней активности
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
