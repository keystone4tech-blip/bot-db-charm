import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Share2, Copy, BarChart3, Trophy, Gift, Star, Coins, TrendingDown, TrendingUp } from 'lucide-react';
import { AreaChartGradient } from '@/components/charts/AreaChartGradient';
import { PieChartInteractive } from '@/components/charts/PieChartInteractive';
import { NumberCounter } from '@/components/charts/NumberCounter';
import { InteractiveBackground } from '@/components/3d/InteractiveBackground';
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

export const ReferralProgramView = (_props: ReferralProgramViewProps) => {
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
  const referralLink = authProfile?.referral_code ? `https://t.me/Keystone_Tech_Robot?start=${authProfile.referral_code}` : '';

  const levelChartData = levelCounts.map((l) => ({ level: `L${l.level}`, count: l.count }));
  const pieData = levelCounts.map((l) => ({ name: `Уровень ${l.level}`, value: l.count }));

  const referralsTrend = Math.max(-12, Math.min(12, (Math.sin(totalReferrals * 0.17) + Math.cos(totalEarnings * 0.11)) * 6));
  const earningsTrend = Math.max(-12, Math.min(12, (Math.sin(totalEarnings * 0.23) + Math.cos(totalReferrals * 0.09)) * 6));

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

  const levelThresholds = [5, 20, 50, 100, 200];


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
    <InteractiveBackground className="px-4 pb-24" intensity={0.85}>
      <div className="mt-6 space-y-6 page-enter">
        {/* Header */}
        <PageHeader
          icon="users"
          title="Реферальная программа"
          subtitle="Приглашайте друзей и зарабатывайте вместе"
        />

        {/* Stats overview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="grid grid-cols-2 gap-3">
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Всего рефералов</div>
                    <div className="mt-1 text-2xl font-extrabold tracking-tight">
                      <NumberCounter value={totalReferrals} durationMs={900} />
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-1 text-xs font-semibold", referralsTrend >= 0 ? "text-green-500" : "text-red-500")}>
                    {referralsTrend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(referralsTrend).toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Заработано</div>
                    <div className="mt-1 text-2xl font-extrabold tracking-tight flex items-center gap-1">
                      <NumberCounter value={totalEarnings} decimals={2} durationMs={1100} />
                      <Coins className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-1 text-xs font-semibold", earningsTrend >= 0 ? "text-green-500" : "text-red-500")}>
                    {earningsTrend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(earningsTrend).toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Динамика по уровням
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <AreaChartGradient data={levelChartData} xKey="level" yKey="count" height={200} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Распределение по уровням
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <PieChartInteractive data={pieData} height={250} />
            </CardContent>
          </Card>
        </motion.div>

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
            <div className="space-y-3">
              {levelCounts.map((level, idx) => {
                const threshold = levelThresholds[idx] ?? levelThresholds[levelThresholds.length - 1];
                const progress = Math.min(1, threshold ? level.count / threshold : 0);

                return (
                  <motion.div
                    key={level.level}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 + idx * 0.05 }}
                    className="rounded-2xl border border-border/60 bg-background/30 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center text-white font-extrabold", level.color)}>
                          L{level.level}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{level.count} рефералов</div>
                          <div className="text-xs text-muted-foreground">
                            До следующего уровня: {Math.max(0, threshold - level.count)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Награда</div>
                        <div className="text-sm font-semibold flex items-center justify-end gap-1">
                          {level.reward}
                          <Coins className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 h-2 rounded-full bg-secondary/40 overflow-hidden">
                      <div className="h-full bg-[var(--gradient-gold)]" style={{ width: `${Math.round(progress * 100)}%` }} />
                    </div>
                  </motion.div>
                );
              })}

              <p className="text-xs text-muted-foreground text-center">
                Награды начисляются по уровням: L1 = {levelCounts[0].reward}, L2 = {levelCounts[1].reward}, далее по схеме.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </InteractiveBackground>
  );
};