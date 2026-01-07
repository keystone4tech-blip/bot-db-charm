import { motion } from 'framer-motion';
import { Megaphone, Users, Eye, Sparkles, ArrowRight, Plus } from 'lucide-react';

interface TelegramChannel {
  id: string;
  channel_title: string;
  channel_username: string | null;
  subscribers_count: number | null;
  is_verified: boolean | null;
}

interface ChannelStatusCardProps {
  channel: TelegramChannel | null;
  onNavigate: (tab: string) => void;
}

export const ChannelStatusCard = ({ channel, onNavigate }: ChannelStatusCardProps) => {
  const isConnected = !!channel;
  
  // Mock data for demonstration - in real app these would come from analytics
  const viewsCount = 12500;
  const impressionsCount = 45000;
  const availablePoints = 1500;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-4 border border-border"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${isConnected ? 'bg-primary/20' : 'bg-muted'}`}>
          <Megaphone className={`w-5 h-5 ${isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Канал для продвижения</h3>
          <p className="text-xs text-muted-foreground">
            {isConnected ? channel.channel_title : 'Не подключён'}
          </p>
        </div>
        {isConnected && channel.is_verified && (
          <div className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
            Верифицирован
          </div>
        )}
      </div>

      {isConnected ? (
        <div className="space-y-3">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Подписчики</span>
              </div>
              <p className="text-lg font-bold">{(channel.subscribers_count || 0).toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-muted-foreground">Просмотры</span>
              </div>
              <p className="text-lg font-bold">{viewsCount.toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-muted-foreground">Показы</span>
              </div>
              <p className="text-lg font-bold">{impressionsCount.toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-primary/30 flex items-center justify-center">
                  <span className="text-[10px] text-primary font-bold">P</span>
                </div>
                <span className="text-xs text-muted-foreground">Баллы</span>
              </div>
              <p className="text-lg font-bold text-primary">{availablePoints.toLocaleString()}</p>
            </div>
          </div>

          {/* Buy Subscribers Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('subscription')}
            className="w-full py-2.5 rounded-xl gold-gradient text-primary-foreground font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Приобрести подписчиков
          </motion.button>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('promotion')}
          className="w-full py-2.5 rounded-xl bg-primary/10 text-primary font-medium flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
        >
          Подключить канал
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
};
