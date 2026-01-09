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
<<<<<<< HEAD
import { getAdminStats } from '@/lib/adminApi';
=======

const statsData = [
  { label: 'Всего пользователей', value: '1,234', icon: Users, trend: '+12%', color: 'text-blue-500' },
  { label: 'Активные боты', value: '89', icon: Bot, trend: '+5%', color: 'text-green-500' },
  { label: 'Подписки', value: '456', icon: CreditCard, trend: '+8%', color: 'text-primary' },
  { label: 'VPN ключи', value: '234', icon: Shield, trend: '+15%', color: 'text-purple-500' },
  { label: 'Доход за месяц', value: '₽45,678', icon: TrendingUp, trend: '+23%', color: 'text-emerald-500' },
  { label: 'Активность', value: '98%', icon: Activity, trend: '+2%', color: 'text-orange-500' },
];
>>>>>>> 8138b3a2be49d3069810e92ea76d823b941a2876

export const AdminStatsView = () => {
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
