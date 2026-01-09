import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Share2, Copy, BarChart3, Trophy, Gift, Star, ArrowLeft } from 'lucide-react';
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
    { level: 1, count: authReferralStats?.level_1_count || 0, color: 'bg-blue-500', reward: '$1.00' },
    { level: 2, count: authReferralStats?.level_2_count || 0, color: 'bg-green-500', reward: '$0.50' },
    { level: 3, count: authReferralStats?.level_3_count || 0, color: 'bg-purple-500', reward: '$0.25' },
    { level: 4, count: authReferralStats?.level_4_count || 0, color: 'bg-yellow-500', reward: '$0.10' },
    { level: 5, count: authReferralStats?.level_5_count || 0, color: 'bg-red-500', reward: '$0.05' },
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
    { level: 1, threshold: 5, reward: '$5.00', achieved: totalReferrals >= 5 },
    { level: 2, threshold: 25, reward: '$25.00', achieved: totalReferrals >= 25 },
    { level: 3, threshold: 100, reward: '$100.00', achieved: totalReferrals >= 100 },
  ];


  return (
    <div className="px-4 pb-24 space-y-6">
      {/* Header */}
      <PageHeader
        icon="users"
        title="Реферальная программа"
        subtitle="Приглашайте друзей и зарабатывайте вместе"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">{totalReferrals}</div>
              <div className="text-sm text-muted-foreground">Рефералов</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-500">${totalEarnings.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Заработано</div>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Ваша реферальная ссылка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 bg-secondary rounded-lg px-3 py-2 text-sm font-mono truncate">
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
            <p className="text-xs text-muted-foreground mt-2">
              Поделитесь этой ссылкой с друзьями и получайте награды за каждого, кто зарегистрируется
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rewards Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Награды
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rewards.map((reward, index) => (
              <div key={reward.level} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reward.achieved ? 'bg-green-500' : 'bg-gray-500'}`}>
                    {reward.achieved ? (
                      <Star className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white text-xs font-bold">{reward.level}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">Приведите {reward.threshold} человек</div>
                    <div className="text-sm text-muted-foreground">Награда: {reward.reward}</div>
                  </div>
                </div>
                <Badge variant={reward.achieved ? 'default' : 'secondary'}>
                  {reward.achieved ? 'Получено' : 'В процессе'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Level Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Уровневые награды
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {levelCounts.map((level) => (
                <div key={level.level} className="text-center">
                  <div className={`${level.color} w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white text-sm font-bold mb-1`}>
                    {level.count}
                  </div>
                  <div className="text-xs text-muted-foreground">L{level.level}</div>
                  <div className="text-xs text-primary font-medium">{level.reward}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              За каждого реферала 1-го уровня вы получаете {levelCounts[0].reward}, за 2-го уровня - {levelCounts[1].reward} и т.д.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Топ рефералов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((rank) => (
                <div key={rank} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    rank === 1 ? 'bg-yellow-500 text-white' :
                    rank === 2 ? 'bg-gray-400 text-white' :
                    'bg-amber-700 text-white'
                  }`}>
                    {rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Пользователь {rank}</div>
                    <div className="text-xs text-muted-foreground">{rank * 15} рефералов</div>
                  </div>
                  <div className="text-sm font-medium">+${(rank * 15).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};