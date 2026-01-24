import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BotStatusCardProps {
  bot: any; // UserBot
  subscriptionExpiresAt: string | null;
  onNavigate: (tab: string) => void;
}

export const BotStatusCard = ({ bot, subscriptionExpiresAt, onNavigate }: BotStatusCardProps) => {
  const isActive = bot?.is_active || false;
  const isSubscribed = subscriptionExpiresAt && new Date(subscriptionExpiresAt) > new Date();
  const botName = bot?.bot_name || 'Telegram бот';
  const botUsername = bot?.bot_username || 'не указан';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/70 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isActive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {isActive ? (
                  <Bot className="w-5 h-5 text-green-500" />
                ) : (
                  <Bot className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{botName}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={isActive ? 'default' : 'secondary'}>
                    {isActive ? 'Активен' : 'Не активен'}
                  </Badge>
                  {isSubscribed && (
                    <Badge variant="outline" className="text-green-500 border-green-500/30">
                      Подписка активна
                    </Badge>
                  )}
                </div>
                {isActive && (
                  <p className="text-xs text-muted-foreground mt-1">@{botUsername}</p>
                )}
              </div>
            </div>
            <Button
              variant={isActive ? "secondary" : "default"}
              className={isActive ?
                "text-purple-500 border-purple-500/30 hover:bg-purple-500/10" :
                "gold-gradient text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:animate-pulse-gold"}
              size="sm"
              onClick={() => onNavigate('subscription')}
            >
              {isActive ? 'Управление' : 'Подключить'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};