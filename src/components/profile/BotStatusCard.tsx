import { motion } from 'framer-motion';
import { Bot, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface UserBot {
  id: string;
  bot_name: string;
  bot_username: string | null;
  bot_type: string;
  is_active: boolean | null;
  created_at: string | null;
}

// Bot subscription typically expires based on subscription
interface BotStatusCardProps {
  bot: UserBot | null;
  subscriptionExpiresAt: string | null;
  onNavigate: (tab: string) => void;
}

export const BotStatusCard = ({ bot, subscriptionExpiresAt, onNavigate }: BotStatusCardProps) => {
  const isCreated = !!bot;
  const expiresAt = subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null;
  const isActive = bot?.is_active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl p-4 border border-border"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${isCreated && isActive ? 'bg-primary/20' : 'bg-muted'}`}>
          <Bot className={`w-5 h-5 ${isCreated && isActive ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Реферальный бот</h3>
          <p className="text-xs text-muted-foreground">
            {isCreated ? bot.bot_name : 'Не создан'}
          </p>
        </div>
        {isCreated && (
          <div className={`px-2 py-1 rounded-full text-xs ${
            isActive 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {isActive ? 'Активен' : 'Неактивен'}
          </div>
        )}
      </div>

      {isCreated ? (
        <div className="space-y-2">
          {bot.bot_username && (
            <div className="text-sm text-muted-foreground">
              @{bot.bot_username}
            </div>
          )}
          {expiresAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Работает до:</span>
              <span className="font-medium text-primary">
                {format(expiresAt, 'd MMMM yyyy', { locale: ru })}
              </span>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Тип: {bot.bot_type === 'referral' ? 'Реферальный' : bot.bot_type}
          </div>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('subscription')}
          className="w-full py-2.5 rounded-xl bg-primary/10 text-primary font-medium flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
        >
          Создать бота
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
};
