import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useTelegramContext } from './TelegramProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Header = () => {
  const { user, isTelegram } = useTelegramContext();

  const displayName = user?.first_name || 'Гость';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border"
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 ring-2 ring-primary/20">
            <AvatarImage src={user?.photo_url} alt={displayName} />
            <AvatarFallback className="telegram-gradient text-primary-foreground text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Привет, {displayName}!
            </p>
            <p className="text-xs text-muted-foreground">
              {isTelegram ? 'Telegram Mini App' : 'Web версия'}
            </p>
          </div>
        </div>
        <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
      </div>
    </motion.header>
  );
};
