import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Share2, Copy, BarChart3, Trophy, Gift, Star, ArrowLeft, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTelegramContext } from '@/components/TelegramProvider';
import { PageHeader } from '@/components/ui/PageHeader';

interface ReferralProgramViewProps {
  referralLink?: string;
  referralStats?: any; // ReferralStats
  onNavigate?: (tab: string) => void;
}

export const ReferralProgramView = ({ onNavigate }: ReferralProgramViewProps) => {
  const { authProfile, authReferralStats } = useTelegramContext();
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);

  useEffect(() => {
    setShareSupported(!!navigator.share);
  }, []);

  // Используем данные из контекста
  const totalReferrals = authReferralStats?.total_referrals || 0;
  const totalEarnings = authReferralStats?.total_earnings || 0;
  const levelCounts = [
    { level: 1, count: authReferralStats?.level_1_count || 0, color: 'bg-blue-500', reward: '1.00', rewardCoins: 100 },
    { level: 2, count: authReferralStats?.level_2_count || 0, color: 'bg-green-500', reward: '0.50', rewardCoins: 50 },
    { level: 3, count: authReferralStats?.level_3_count || 0, color: 'bg-purple-500', reward: '0.25', rewardCoins: 25 },
    { level: 4, count: authReferralStats?.level_4_count || 0, color: 'bg-yellow-500', reward: '0.10', rewardCoins: 10 },
    { level: 5, count: authReferralStats?.level_5_count || 0, color: 'bg-red-500', reward: '0.05', rewardCoins: 5 },
  ];
  const referralLink = authProfile?.referral_code ? `https://t.me/Keystone_Tech_bot?start=${authProfile.referral_code}` : '';

  const handleShare = async () => {
    if (referralLink) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Присоединяйтесь к Keystone Tech!',
            text: 'Присоединяйтесь к Keystone Tech и начните зарабатывать!',
            url: referralLink
          });
        } catch (err) {
          console.error('Error sharing:', err);
        }
      } else {
        handleCopy();
      }
    }
  };

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const rewards = [
    { level: 1, threshold: 5, reward: '5', rewardCoins: 5, achieved: totalReferrals >= 5 },
    { level: 2, threshold: 25, reward: '25', rewardCoins: 25, achieved: totalReferrals >= 25 },
    { level: 3, threshold: 100, reward: '100', rewardCoins: 100, achieved: totalReferrals >= 100 },
  ];


  return (
    <div className="px-4 pb-24">
      <div className="mt-6 space-y-6">
        {/* Header */}
        <PageHeader
          icon="users"
          title="Реферальная программа"
          subtitle="Приглашайте друзей и зарабатывайте вместе"
        />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 rounded-2xl p-4">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{totalReferrals}</div>
              <div className="text-xs text-muted-foreground">Рефералов</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20 rounded-2xl p-4">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-500 flex items-center justify-center gap-1">
                <span>{totalEarnings.toFixed(2)}</span>
                <Coins className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-xs text-muted-foreground">Заработано</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Referral Link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Ваша реферальная ссылка</h3>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 bg-secondary/30 rounded-xl px-3 py-2 text-sm font-mono truncate">
                {referralLink || 'Загрузка...'}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!referralLink}
              >
                {copied ? 'Скопировано!' : <Copy className="w-4 h-4" />}
              </Button>
              {shareSupported && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  disabled={!referralLink}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Поделитесь этой ссылкой с друзьями и получайте награды за каждого, кто зарегистрируется
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Rewards Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Награды</h3>
          </div>
          <div className="space-y-3">
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  reward.achieved ? 'border-primary/30 bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${reward.achieved ? 'bg-green-500/10 text-green-500' : 'bg-secondary/30 text-muted-foreground'}`}>
                    {reward.achieved ? (
                      <Star className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="text-xs font-bold">{reward.level}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">Приведите {reward.threshold} человек</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Награда: {reward.reward}
                      <Coins className="w-4 h-4 text-yellow-500" />
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={reward.achieved ? 'default' : 'secondary'}>
                    {reward.achieved ? 'Получено' : 'В процессе'}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Level Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Уровневые награды</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {levelCounts.map((level) => (
                <div key={level.level} className="text-center">
                  <div className={`${level.color} w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white text-sm font-bold mb-1`}>
                    {level.count}
                  </div>
                  <div className="text-xs text-muted-foreground">L{level.level}</div>
                  <div className="text-xs text-primary font-medium flex items-center justify-center gap-0.5">
                    {level.reward}
                    <Coins className="w-3 h-3 text-yellow-500" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              За каждого реферала 1-го уровня вы получаете {levelCounts[0].reward} <Coins className="w-3 h-3 text-yellow-500 inline" />, за 2-го уровня - {levelCounts[1].reward} <Coins className="w-3 h-3 text-yellow-500 inline" /> и т.д.
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Топ рефералов</h3>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((rank) => (
              <motion.div
                key={rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + rank * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/30 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  rank === 1 ? 'bg-yellow-500 text-white' :
                  rank === 2 ? 'bg-gray-400 text-white' :
                  'bg-amber-700 text-white'
                }`}>
                  {rank}
                </div>
                <div className="flex-1">
                  <div className="font-medium">Пользователь {rank}</div>
                  <div className="text-sm text-muted-foreground">{rank * 15} рефералов</div>
                </div>
                <div className="text-sm font-medium flex items-center gap-1">
                  +{(rank * 15).toFixed(2)}
                  <Coins className="w-4 h-4 text-yellow-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  </div>
  );
};