import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Users, Link2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ReferralStatsData } from '@/hooks/useProfile';
import { ReferralChart } from './ReferralChart';

interface ReferralSectionProps {
  referralLink: string | null;
  referralStats: ReferralStatsData | null;
}

export const ReferralSection = ({ referralLink, referralStats }: ReferralSectionProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Ссылка скопирована!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Не удалось скопировать');
    }
  };

  const shareLink = async () => {
    if (!referralLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Keystone Tech',
          text: 'Присоединяйся к Keystone Tech по моей реферальной ссылке!',
          url: referralLink,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const levelData = referralStats ? [
    { level: 1, count: referralStats.level_1_count, percent: 10, color: 'hsl(var(--primary))' },
    { level: 2, count: referralStats.level_2_count, percent: 5, color: 'hsl(var(--success))' },
    { level: 3, count: referralStats.level_3_count, percent: 3, color: 'hsl(var(--gold))' },
    { level: 4, count: referralStats.level_4_count, percent: 2, color: 'hsl(var(--warning))' },
    { level: 5, count: referralStats.level_5_count, percent: 1, color: 'hsl(var(--accent))' },
  ] : [];

  const totalReferrals = referralStats?.total_referrals || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6"
    >
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        Реферальная программа
      </h3>

      {/* Referral Link Card */}
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Ваша реферальная ссылка</span>
        </div>
        
        <div className="bg-secondary/50 rounded-lg p-3 mb-3">
          <p className="text-xs text-muted-foreground truncate font-mono">
            {referralLink || 'Ссылка не доступна'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={copyToClipboard}
            disabled={!referralLink}
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2 text-success" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? 'Скопировано' : 'Копировать'}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={shareLink}
            disabled={!referralLink}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Поделиться
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-4 border border-border text-center"
        >
          <motion.p
            key={totalReferrals}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-primary"
          >
            {totalReferrals}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">Всего рефералов</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-xl p-4 border border-border text-center"
        >
          <motion.p
            key={referralStats?.total_earnings}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-gold"
          >
            {(referralStats?.total_earnings || 0).toFixed(2)}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">Заработано ₽</p>
        </motion.div>
      </div>

      {/* Level Stats with Chart */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h4 className="text-sm font-semibold text-foreground mb-4">Статистика по уровням</h4>
        
        {totalReferrals > 0 ? (
          <ReferralChart levelData={levelData} />
        ) : (
          <div className="text-center py-6">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Пока нет рефералов</p>
            <p className="text-xs text-muted-foreground mt-1">Поделитесь ссылкой, чтобы начать зарабатывать</p>
          </div>
        )}

        {/* Level breakdown */}
        <div className="space-y-3 mt-4">
          {levelData.map((level, index) => (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: level.color }}
                />
                <span className="text-sm text-foreground">Уровень {level.level}</span>
                <span className="text-xs text-muted-foreground">({level.percent}%)</span>
              </div>
              <motion.span
                key={level.count}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-sm font-semibold text-foreground"
              >
                {level.count}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
