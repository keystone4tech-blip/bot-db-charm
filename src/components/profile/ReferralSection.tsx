import { motion } from 'framer-motion';
import { Users, Share2, Copy, BarChart3, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReferralSectionProps {
  referralLink: string | null;
  referralStats: any; // ReferralStats
  onNavigate?: (tab: string) => void;
}

export const ReferralSection = ({ referralLink, referralStats, onNavigate }: ReferralSectionProps) => {
  const totalReferrals = referralStats?.total_referrals || 0;
  const totalEarnings = referralStats?.total_earnings || 0;
  const levelCounts = [
    { level: 1, count: referralStats?.level_1_count || 0, color: 'bg-blue-500' },
    { level: 2, count: referralStats?.level_2_count || 0, color: 'bg-green-500' },
    { level: 3, count: referralStats?.level_3_count || 0, color: 'bg-purple-500' },
    { level: 4, count: referralStats?.level_4_count || 0, color: 'bg-yellow-500' },
    { level: 5, count: referralStats?.level_5_count || 0, color: 'bg-red-500' },
  ];

  const handleShare = () => {
    if (referralLink) {
      if (navigator.share) {
        navigator.share({
          title: 'Присоединяйтесь к Keystone Tech!',
          text: 'Присоединяйтесь к Keystone Tech и начните зарабатывать!',
          url: referralLink
        });
      } else {
        navigator.clipboard.writeText(referralLink);
      }
    }
  };

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
    }
  };

  const handleViewDetails = () => {
    onNavigate?.('referral');
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Реферальная программа
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {totalReferrals} рефералов
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewDetails}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
            <span className="text-sm text-muted-foreground">Ваша реферальная ссылка:</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4 mr-1" />
                Копировать
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Поделиться
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
            <span className="text-sm text-muted-foreground">Ваш реферальный код:</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (referralStats?.referral_code) {
                    navigator.clipboard.writeText(referralStats.referral_code);
                  }
                }}
              >
                <Copy className="w-4 h-4 mr-1" />
                Копировать
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-secondary/30 rounded-xl">
            <div className="text-2xl font-bold text-primary">{totalReferrals}</div>
            <div className="text-xs text-muted-foreground">Всего рефералов</div>
          </div>
          <div className="text-center p-3 bg-secondary/30 rounded-xl">
            <div className="text-2xl font-bold text-green-500">${totalEarnings.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Заработано</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            По уровням:
          </h4>
          <div className="flex gap-2">
            {levelCounts.map((level) => (
              <div key={level.level} className="flex-1 text-center">
                <div className={`w-8 h-8 mx-auto rounded-full ${level.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {level.count}
                </div>
                <div className="text-xs text-muted-foreground mt-1">L{level.level}</div>
              </div>
            ))}
          </div>
        </div>

        <Button
          className="w-full gold-gradient text-white"
          onClick={handleViewDetails}
        >
          Подробнее о программе
        </Button>
      </CardContent>
    </Card>
  );
};