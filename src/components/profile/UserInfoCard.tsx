import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Mail, MapPin, Phone, Link as LinkIcon, User, AtSign } from 'lucide-react';
import { ExtendedUserProfile } from '@/hooks/useProfile';

interface UserInfoCardProps {
  profile: ExtendedUserProfile;
}

export const UserInfoCard = ({ profile }: UserInfoCardProps) => {
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // Можно добавить уведомление о копировании
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Информация о пользователе
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {/* Имя и фамилия */}
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
            <span className="text-sm text-muted-foreground">Имя:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{profile.first_name}</span>
              {profile.last_name && (
                <span className="font-medium">{profile.last_name}</span>
              )}
            </div>
          </div>

          {/* Никнейм */}
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
            <span className="text-sm text-muted-foreground">Никнейм:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">@{profile.telegram_username || 'не указан'}</span>
              {profile.telegram_username && (
                <button 
                  onClick={() => handleCopy(profile.telegram_username!, 'никнейм')}
                  className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Реферальная ссылка */}
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
            <span className="text-sm text-muted-foreground">Реферальная ссылка:</span>
            <div className="flex items-center gap-2 max-w-[60%]">
              <span className="font-medium truncate">
                {profile.referral_code 
                  ? `https://t.me/Keystone_Tech_bot?start=${profile.referral_code}` 
                  : 'не создана'}
              </span>
              {profile.referral_code && (
                <button 
                  onClick={() => handleCopy(`https://t.me/Keystone_Tech_bot?start=${profile.referral_code}`, 'реферальная ссылка')}
                  className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Реферальный код */}
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
            <span className="text-sm text-muted-foreground">Реферальный код:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{profile.referral_code || 'не создан'}</span>
              {profile.referral_code && (
                <button 
                  onClick={() => handleCopy(profile.referral_code, 'реферальный код')}
                  className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Город */}
          {profile.city && (
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
              <span className="text-sm text-muted-foreground">Город:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{profile.city}</span>
                <button 
                  onClick={() => handleCopy(profile.city, 'город')}
                  className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Телефон */}
          {profile.phone && (
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
              <span className="text-sm text-muted-foreground">Телефон:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{profile.phone}</span>
                <button 
                  onClick={() => handleCopy(profile.phone, 'телефон')}
                  className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Email */}
          {profile.email && (
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
              <span className="text-sm text-muted-foreground">Email:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{profile.email}</span>
                <button 
                  onClick={() => handleCopy(profile.email, 'email')}
                  className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* О себе */}
          {profile.bio && (
            <div className="flex flex-col p-3 bg-primary/5 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">О себе:</span>
                <button 
                  onClick={() => handleCopy(profile.bio, 'информация о себе')}
                  className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm">{profile.bio}</p>
            </div>
          )}

          {/* Ссылка */}
          {profile.link && (
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl">
              <span className="text-sm text-muted-foreground">Ссылка:</span>
              <div className="flex items-center gap-2 max-w-[60%]">
                <span className="font-medium truncate">{profile.link}</span>
                <button 
                  onClick={() => handleCopy(profile.link, 'ссылка')}
                  className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};