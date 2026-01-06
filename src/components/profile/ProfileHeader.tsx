import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Edit2 } from 'lucide-react';
import { ProfileData } from '@/hooks/useProfile';

interface ProfileHeaderProps {
  profile: ProfileData | null;
  telegramUser: { first_name?: string; last_name?: string; photo_url?: string } | null;
  onEditClick: () => void;
}

export const ProfileHeader = ({ profile, telegramUser, onEditClick }: ProfileHeaderProps) => {
  const displayName = profile?.first_name 
    ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`
    : telegramUser?.first_name 
      ? `${telegramUser.first_name}${telegramUser.last_name ? ` ${telegramUser.last_name}` : ''}`
      : 'Гость';
  
  const username = profile?.telegram_username 
    ? `@${profile.telegram_username}` 
    : 'Telegram Mini App';
  
  const initials = (profile?.first_name?.slice(0, 1) || telegramUser?.first_name?.slice(0, 1) || 'G') + 
                   (profile?.last_name?.slice(0, 1) || telegramUser?.last_name?.slice(0, 1) || '');
  
  const avatarUrl = profile?.avatar_url || telegramUser?.photo_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 text-center border border-border relative overflow-hidden"
    >
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="relative inline-block">
          <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/20">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEditClick}
            className="absolute bottom-3 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg"
          >
            <Camera className="w-4 h-4" />
          </motion.button>
        </div>
        
        <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
        <p className="text-sm text-muted-foreground mt-1">{username}</p>
        
        {profile?.telegram_id && (
          <p className="text-xs text-muted-foreground mt-2 opacity-60">ID: {profile.telegram_id}</p>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={onEditClick}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Редактировать профиль
        </Button>
      </div>
    </motion.div>
  );
};
