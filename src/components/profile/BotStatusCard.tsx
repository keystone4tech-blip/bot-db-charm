import { motion } from 'framer-motion';
import { Bot, Settings, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BotStatusCardProps {
  bot: any; // UserBot
  subscriptionExpiresAt: string | null;
  onNavigate: (tab: string) => void;
}

export const BotStatusCard = ({ bot, subscriptionExpiresAt, onNavigate }: BotStatusCardProps) => {
  const isActive = bot?.is_active || false;
  const isSubscribed = subscriptionExpiresAt && new Date(subscriptionExpiresAt) > new Date();
  const botName = bot?.bot_name || 'Мой бот';
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
              <div className={`p-2 rounded-lg ${isActive ? 'bg-purple-500/10' : 'bg-gray-500/10'}`}>
                {isActive ? (
                  <Bot className="w-5 h-5 text-purple-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-500" />
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
              variant="outline"
              size="sm"
              onClick={() => onNavigate('subscription')}
            >
              Управление
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};