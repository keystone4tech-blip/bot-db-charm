import { motion } from 'framer-motion';
import { Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { BalanceData } from '@/hooks/useProfile';

interface BalanceCardsProps {
  balance: BalanceData | null;
}

export const BalanceCards = ({ balance }: BalanceCardsProps) => {
  const balanceItems = [
    {
      label: 'Внутренний баланс',
      value: balance?.internal_balance || 0,
      icon: Wallet,
      color: 'from-primary to-primary/70',
      delay: 0,
    },
    {
      label: 'Внешний баланс',
      value: balance?.external_balance || 0,
      icon: TrendingUp,
      color: 'from-success to-success/70',
      delay: 0.1,
    },
    {
      label: 'Всего заработано',
      value: balance?.total_earned || 0,
      icon: ArrowDownCircle,
      color: 'from-gold to-gold-dark',
      delay: 0.2,
    },
    {
      label: 'Выведено',
      value: balance?.total_withdrawn || 0,
      icon: ArrowUpCircle,
      color: 'from-muted-foreground/50 to-muted-foreground/30',
      delay: 0.3,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-6"
    >
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-primary" />
        Балансы
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {balanceItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: item.delay }}
              className="bg-card rounded-xl p-4 border border-border relative overflow-hidden group hover:border-primary/30 transition-colors"
            >
              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${item.color}`}>
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {item.value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
