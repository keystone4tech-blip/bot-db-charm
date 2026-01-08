import { motion } from 'framer-motion';
import { MessageSquare, Users, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChannelStatusCardProps {
  channel: any; // TelegramChannel
  onNavigate: (tab: string) => void;
}

export const ChannelStatusCard = ({ channel, onNavigate }: ChannelStatusCardProps) => {
  const isActive = !!channel;
  const subscriberCount = channel?.subscribers_count || 0;
  const isVerified = channel?.is_verified || false;
  const channelTitle = channel?.channel_title || 'Мой канал';
  const channelUsername = channel?.channel_username || 'не указан';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/70 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500/10' : 'bg-gray-500/10'}`}>
                {isActive ? (
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{channelTitle}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={isActive ? 'default' : 'secondary'}>
                    {isActive ? 'Подключен' : 'Не подключен'}
                  </Badge>
                  {isActive && (
                    <>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {subscriberCount.toLocaleString()}
                      </div>
                      {isVerified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </>
                  )}
                </div>
                {isActive && (
                  <p className="text-xs text-muted-foreground mt-1">@{channelUsername}</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('promotion')}
            >
              Управление
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};