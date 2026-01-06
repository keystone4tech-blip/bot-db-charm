import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  index: number;
}

export const StatsCard = ({ icon: Icon, label, value, trend, trendUp, index }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="bg-card rounded-2xl p-4 shadow-card border border-border"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl telegram-gradient flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
      {trend && (
        <p className={cn(
          "text-xs mt-2 font-medium",
          trendUp ? "text-telegram-green" : "text-destructive"
        )}>
          {trend}
        </p>
      )}
    </motion.div>
  );
};
