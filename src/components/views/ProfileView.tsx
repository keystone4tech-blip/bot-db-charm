import { motion } from 'framer-motion';
import { useTelegramContext } from '@/components/TelegramProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Calendar, Target, Trophy } from 'lucide-react';

export const ProfileView = () => {
  const { user, isTelegram } = useTelegramContext();

  const displayName = user?.first_name 
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : 'Гость';
  const username = user?.username ? `@${user.username}` : 'Telegram Mini App';
  const initials = (user?.first_name?.slice(0, 1) || 'G') + (user?.last_name?.slice(0, 1) || '');

  const achievements = [
    { icon: Trophy, label: 'Первая задача', unlocked: true },
    { icon: Target, label: '10 задач', unlocked: true },
    { icon: Calendar, label: '7 дней подряд', unlocked: false },
    { icon: Award, label: 'Мастер', unlocked: false },
  ];

  return (
    <div className="px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <div className="bg-card rounded-2xl p-6 text-center border border-border">
          <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-primary/20">
            <AvatarImage src={user?.photo_url} alt={displayName} />
            <AvatarFallback className="telegram-gradient text-primary-foreground text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
          <p className="text-sm text-muted-foreground mt-1">{username}</p>
          
          {isTelegram && user?.id && (
            <p className="text-xs text-muted-foreground mt-2">ID: {user.id}</p>
          )}

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div>
              <p className="text-2xl font-bold text-foreground">47</p>
              <p className="text-xs text-muted-foreground">Задач</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">89%</p>
              <p className="text-xs text-muted-foreground">Успех</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">5</p>
              <p className="text-xs text-muted-foreground">Дней</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Достижения</h3>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className={`bg-card rounded-xl p-4 border border-border ${
                    !achievement.unlocked && 'opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                    achievement.unlocked ? 'telegram-gradient' : 'bg-secondary'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      achievement.unlocked ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <p className="text-sm font-medium text-foreground">{achievement.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {achievement.unlocked ? 'Получено' : 'Заблокировано'}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
