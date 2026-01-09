import { motion } from 'framer-motion';
import { Coins, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BalanceCardsProps {
  balance: any; // UserBalance
}

export const BalanceCards = ({ balance }: BalanceCardsProps) => {
  const internalBalance = balance?.internal_balance || 0;
  const externalBalance = balance?.external_balance || 0;
  const totalEarned = balance?.total_earned || 0;
  const totalWithdrawn = balance?.total_withdrawn || 0;

  const stats = [
    {
      title: 'Внутренний баланс',
      value: internalBalance.toFixed(2),
      icon: Wallet,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Внешний баланс',
      value: externalBalance.toFixed(2),
      icon: Coins,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Всего заработано',
      value: totalEarned.toFixed(2),
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Всего выведено',
      value: totalWithdrawn.toFixed(2),
      icon: TrendingDown,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold px-1">Баланс</h2>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/70 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {stat.title}
                      </p>
                      <p className="font-semibold truncate flex items-center gap-1">
                        {stat.value}
                        <Coins className="w-4 h-4 text-yellow-500" />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};