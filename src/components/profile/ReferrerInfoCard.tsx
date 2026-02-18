import { useState, useEffect } from 'react';
import { UserPlus, ExternalLink, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface ReferrerInfo {
  id: string;
  first_name: string | null;
  last_name: string | null;
  telegram_username: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  created_at: string | null;
}

interface ReferrerInfoCardProps {
  referredBy: string | null;
}

export const ReferrerInfoCard = ({ referredBy }: ReferrerInfoCardProps) => {
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!referredBy) return;
    
    setLoading(true);
    supabase.functions.invoke('user-profile-data', {
      body: { profileId: referredBy, publicView: true },
    }).then(({ data }) => {
      if (data?.profile) {
        setReferrer(data.profile);
      }
    }).finally(() => setLoading(false));
  }, [referredBy]);

  if (!referredBy) {
    return (
      <Card className="rounded-3xl border-border/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <UserPlus className="h-5 w-5" />
            <span className="text-sm">Вы зарегистрировались без пригласителя</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || !referrer) {
    return (
      <Card className="rounded-3xl border-border/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <UserPlus className="h-5 w-5" />
            <span className="text-sm">Загрузка информации о пригласителе...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const referrerName = referrer.first_name
    ? `${referrer.first_name}${referrer.last_name ? ` ${referrer.last_name}` : ''}`
    : 'Пользователь';

  return (
    <>
      <Card className="rounded-3xl border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-5 w-5 text-primary" />
            Пригласитель
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {referrer.avatar_url ? (
                <img
                  src={referrer.avatar_url}
                  alt="Avatar"
                  className="h-10 w-10 rounded-xl object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-secondary/40 flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="font-semibold text-sm">{referrerName}</div>
                {referrer.telegram_username && (
                  <div className="text-xs text-muted-foreground">@{referrer.telegram_username}</div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Профиль
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Профиль пригласителя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {referrer.avatar_url ? (
                <img
                  src={referrer.avatar_url}
                  alt="Avatar"
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-secondary/40 flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="font-bold text-lg">{referrerName}</div>
                {referrer.telegram_username && (
                  <div className="text-sm text-muted-foreground">@{referrer.telegram_username}</div>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {referrer.referral_code && (
                <div className="flex justify-between rounded-xl bg-secondary/30 p-3">
                  <span className="text-muted-foreground">Реферальный код</span>
                  <span className="font-semibold">{referrer.referral_code}</span>
                </div>
              )}
              {referrer.created_at && (
                <div className="flex justify-between rounded-xl bg-secondary/30 p-3">
                  <span className="text-muted-foreground">В системе с</span>
                  <span className="font-semibold">{new Date(referrer.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
