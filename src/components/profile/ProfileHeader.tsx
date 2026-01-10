import { motion } from 'framer-motion';
import { User, Edit3, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { TelegramUser } from '@/hooks/useTelegram';

interface ProfileHeaderProps {
  profile: any; // UserProfile
  telegramUser: TelegramUser | null;
  onEditClick: (() => void) | null;
}

export const ProfileHeader = ({ profile, telegramUser, onEditClick }: ProfileHeaderProps) => {
  const fullName = profile?.first_name ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}` : 'Неизвестный пользователь';
  const username = profile?.telegram_username || telegramUser?.username || 'Не указан';
  const avatarUrl = profile?.avatar_url || telegramUser?.photo_url;

  const handleCopyReferralLink = () => {
    if (profile?.referral_code) {
      const referralLink = `https://t.me/Keystone_Tech_bot?start=${profile.referral_code}`;
      navigator.clipboard.writeText(referralLink);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-border relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/10 blur-xl"></div>
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary/5 blur-xl"></div>

      <div className="relative z-10 flex items-center gap-4">
        <Avatar className="w-16 h-16 border-2 border-primary/20">
          <AvatarImage src={avatarUrl || undefined} alt={fullName} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{fullName}</h2>
          <p className="text-muted-foreground text-sm truncate">@{username}</p>
          
          {profile?.referral_code && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Реф. код: {profile.referral_code}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopyReferralLink}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {onEditClick && (
          <Button
            variant="outline"
            size="icon"
            onClick={onEditClick}
            className="shrink-0"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};