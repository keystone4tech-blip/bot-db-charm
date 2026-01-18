import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  Wallet,
  Users,
  Crown,
  Shield,
  Bot,
  Key,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  AtSign,
  Loader2,
} from 'lucide-react';

interface UserProfileData {
  profile: {
    id: string;
    telegram_id: number;
    telegram_username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email: string | null;
    phone: string | null;
    bio: string | null;
    referral_code: string | null;
    referral_level: number | null;
    created_at: string | null;
  };
  balance: {
    internal_balance: number;
    external_balance: number;
    total_earned: number;
    total_withdrawn: number;
  } | null;
  referral_stats: {
    total_referrals: number;
    total_earnings: number;
    level_1_count: number;
    level_2_count: number;
    level_3_count: number;
    level_4_count: number;
    level_5_count: number;
  } | null;
  subscriptions: Array<{
    id: string;
    plan_name: string;
    status: string;
    expires_at: string | null;
  }>;
  vpn_keys: Array<{
    id: string;
    server_location: string;
    status: string;
    expires_at: string | null;
  }>;
  bots: Array<{
    id: string;
    bot_name: string;
    is_active: boolean;
  }>;
}

interface UserProfilePopupProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const UserProfilePopup = ({ userId, isOpen, onClose, userName }: UserProfilePopupProps) => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData();
    }
  }, [isOpen, userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const serverBaseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${serverBaseUrl}/api/admin-user-profile?user_id=${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch user data');

      setUserData(result);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Ошибка загрузки данных пользователя');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatBalance = (value: number | null | undefined) => {
    return (value || 0).toFixed(2);
  };

  const getDisplayName = () => {
    if (!userData?.profile) return userName || 'Пользователь';
    const { first_name, last_name, telegram_username } = userData.profile;
    if (first_name || last_name) {
      return [first_name, last_name].filter(Boolean).join(' ');
    }
    return telegram_username ? `@${telegram_username}` : 'Пользователь';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Профиль пользователя
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
          </div>
        ) : userData ? (
          <ScrollArea className="max-h-[60vh] pr-2">
            <div className="space-y-4">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={userData.profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{getDisplayName()}</h3>
                  {userData.profile.telegram_username && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <AtSign className="w-3 h-3" />
                      {userData.profile.telegram_username}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      ID: {userData.profile.telegram_id}
                    </Badge>
                    {userData.profile.referral_level && userData.profile.referral_level > 1 && (
                      <Badge className="text-xs bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                        <Crown className="w-3 h-3 mr-1" />
                        Уровень {userData.profile.referral_level}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Info */}
              {(userData.profile.email || userData.profile.phone) && (
                <Card>
                  <CardContent className="p-3 space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Контакты</h4>
                    {userData.profile.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {userData.profile.email}
                      </div>
                    )}
                    {userData.profile.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {userData.profile.phone}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Balance */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Баланс
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Внутренний</p>
                      <p className="font-semibold">{formatBalance(userData.balance?.internal_balance)} ₽</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Внешний</p>
                      <p className="font-semibold">{formatBalance(userData.balance?.external_balance)} ₽</p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Заработано</p>
                      <p className="font-semibold text-green-600">{formatBalance(userData.balance?.total_earned)} ₽</p>
                    </div>
                    <div className="bg-orange-500/10 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Выведено</p>
                      <p className="font-semibold text-orange-600">{formatBalance(userData.balance?.total_withdrawn)} ₽</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Referrals */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Рефералы
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Всего рефералов</span>
                    <Badge variant="secondary">{userData.referral_stats?.total_referrals || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Заработано с рефералов</span>
                    <span className="font-semibold text-green-600">
                      {formatBalance(userData.referral_stats?.total_earnings)} ₽
                    </span>
                  </div>
                  {userData.referral_stats && (
                    <div className="grid grid-cols-5 gap-1 text-center text-xs mt-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div key={level} className="bg-muted/50 rounded p-1">
                          <p className="text-muted-foreground">L{level}</p>
                          <p className="font-medium">
                            {userData.referral_stats?.[`level_${level}_count` as keyof typeof userData.referral_stats] || 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {userData.profile.referral_code && (
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Реф. код: </span>
                      <code className="bg-muted px-1 rounded">{userData.profile.referral_code.substring(0, 8)}...</code>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subscriptions */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Подписки ({userData.subscriptions.length})
                  </h4>
                  {userData.subscriptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет активных подписок</p>
                  ) : (
                    <div className="space-y-2">
                      {userData.subscriptions.slice(0, 3).map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-2">
                          <span>{sub.plan_name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={sub.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {sub.status === 'active' ? 'Активна' : sub.status}
                            </Badge>
                            {sub.expires_at && (
                              <span className="text-xs text-muted-foreground">
                                до {formatDate(sub.expires_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* VPN Keys */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    VPN ключи ({userData.vpn_keys.length})
                  </h4>
                  {userData.vpn_keys.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет VPN ключей</p>
                  ) : (
                    <div className="space-y-2">
                      {userData.vpn_keys.slice(0, 3).map((key) => (
                        <div key={key.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-2">
                          <span>{key.server_location}</span>
                          <Badge variant={key.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {key.status === 'active' ? 'Активен' : key.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bots */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Боты ({userData.bots.length})
                  </h4>
                  {userData.bots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет ботов</p>
                  ) : (
                    <div className="space-y-2">
                      {userData.bots.slice(0, 3).map((bot) => (
                        <div key={bot.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-2">
                          <span>{bot.bot_name}</span>
                          <Badge variant={bot.is_active ? 'default' : 'secondary'} className="text-xs">
                            {bot.is_active ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Registration Date */}
              <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3" />
                Зарегистрирован: {formatDate(userData.profile.created_at)}
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
