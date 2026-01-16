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


  // Функция для получения времени до следующего воскресенья в 9:00 по Москве
  const getNextSunday9AM = () => {
    const now = new Date();
    // Москва находится в часовом поясе UTC+3
    const utc3Offset = 3 * 60; // в минутах
    const localTimeWithOffset = new Date(now.getTime() + (now.getTimezoneOffset() + utc3Offset) * 60000);

    const nextSunday = new Date(localTimeWithOffset);
    nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
    nextSunday.setHours(9, 0, 0, 0); // 9:00 утра

    // Преобразуем обратно в локальное время для отображения
    const utc3Time = new Date(nextSunday.getTime() - utc3Offset * 60000);
    return utc3Time;
  };

  // Функция для вычисления оставшегося времени
  const calculateTimeRemaining = () => {
    const now = new Date();
    const nextBonus = getNextSunday9AM();
    const diff = nextBonus.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000); // Обновляем каждую секунду

    return () => clearInterval(timer);
  }, []);

  // Пример данных для топ-5 рефералов
  const topReferrals = [
    { rank: 1, name: 'Алексей К.', referrals: 125, earnings: 1250.50, position: 'gold' },
    { rank: 2, name: 'Мария С.', referrals: 98, earnings: 980.25, position: 'silver' },
    { rank: 3, name: 'Дмитрий П.', referrals: 87, earnings: 870.75, position: 'bronze' },
    { rank: 4, name: 'Елена В.', referrals: 76, earnings: 760.50, position: 'regular' },
    { rank: 5, name: 'Сергей Н.', referrals: 65, earnings: 650.25, position: 'regular' },
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

        {/* Timer until next bonus */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border-purple-500/20 rounded-2xl p-5">
            <div className="flex flex-col items-center">
              <div className="text-sm text-muted-foreground mb-2">Следующее начисление бонусов</div>
              <div className="flex gap-2 justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{timeRemaining.days}</div>
                  <div className="text-xs text-muted-foreground">дней</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{timeRemaining.hours}</div>
                  <div className="text-xs text-muted-foreground">часов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{timeRemaining.minutes}</div>
                  <div className="text-xs text-muted-foreground">минут</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{timeRemaining.seconds}</div>
                  <div className="text-xs text-muted-foreground">секунд</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">Воскресенье, 9:00 по МСК</div>
            </div>
          </Card>
        </motion.div>

        {/* Leaderboard moved to top */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Топ рефералов</h3>
            </div>
            <div className="space-y-3">
              {topReferrals.map((user) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + user.rank * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/30 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    user.position === 'gold' ? 'bg-yellow-500 text-white' :
                    user.position === 'silver' ? 'bg-gray-400 text-white' :
                    user.position === 'bronze' ? 'bg-amber-700 text-white' :
                    'bg-secondary text-foreground'
                  }`}>
                    {user.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.referrals} рефералов</div>
                  </div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    +{user.earnings.toFixed(2)}
                    <Coins className="w-4 h-4 text-yellow-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
            transition={{ delay: 0.4 }}
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
          transition={{ delay: 0.5 }}
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
          transition={{ delay: 0.6 }}
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
                  transition={{ delay: 0.7 + index * 0.05 }}
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
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Уровневые награды</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
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
      </div>
    </div>
  );
};