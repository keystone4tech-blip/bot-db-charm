import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Plus, ExternalLink, Copy, Check, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { useTelegramContext } from '@/components/TelegramProvider';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  username: string;
  subscribers: number;
  status: 'active' | 'inactive' | 'pending';
  joined_at: string;
}

export const ChannelsView = () => {
  const { authProfile } = useTelegramContext();
  const { profile, isLoading, error } = useProfile();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Используем данные из профиля или из контекста
  const displayProfile = profile || authProfile;

  // Загружаем каналы при загрузке компонента
  useEffect(() => {
    // В реальной реализации здесь будет загрузка каналов из API
    // Для демонстрации создадим фиктивные данные
    const mockChannels: Channel[] = [
      {
        id: '1',
        name: 'Keystone Tech News',
        username: '@keystonetech_news',
        subscribers: 12500,
        status: 'active',
        joined_at: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Tech Reviews',
        username: '@tech_reviews',
        subscribers: 8750,
        status: 'active',
        joined_at: '2024-02-20T14:45:00Z'
      },
      {
        id: '3',
        name: 'Daily Tech Tips',
        username: '@daily_tech_tips',
        subscribers: 5400,
        status: 'pending',
        joined_at: '2024-03-10T09:15:00Z'
      }
    ];

    setChannels(mockChannels);
  }, []);

  const handleAddChannel = () => {
    // В реальной реализации здесь будет логика добавления канала
    console.log('Добавить канал');
  };

  const handleCopyId = (channelId: string) => {
    navigator.clipboard.writeText(channelId);
    setCopiedId(channelId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'inactive':
        return 'Неактивен';
      case 'pending':
        return 'На проверке';
      default:
        return 'Неизвестен';
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 pb-24 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <Radio className="w-full h-full text-primary animate-spin" />
          </motion.div>
          <p className="text-muted-foreground">Загрузка каналов...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !displayProfile) {
    return (
      <div className="px-4 py-6 pb-24 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <Radio className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">Откройте приложение через Telegram бота</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="px-4 py-6 pb-24 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <PageHeader
        icon="radio"
        title="Мои каналы"
        subtitle="Управление вашими Telegram каналами"
      />

      {/* Add Channel Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-4">
            <Button
              className="w-full gold-gradient text-primary-foreground font-medium py-6"
              onClick={handleAddChannel}
            >
              <Plus className="w-5 h-5 mr-2" />
              Подключить канал
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Channels List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold px-1 flex items-center gap-2">
          <Radio className="w-5 h-5" />
          Подключенные каналы
        </h2>

        {channels.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Radio className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Нет подключенных каналов</h3>
            <p className="text-muted-foreground mb-4">
              Подключите ваш Telegram канал для управления и аналитики
            </p>
            <Button
              variant="outline"
              onClick={handleAddChannel}
            >
              <Plus className="w-4 h-4 mr-2" />
              Подключить канал
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {channels.map((channel, index) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Radio className="w-5 h-5 text-primary" />
                          {channel.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {channel.username}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(channel.status)}>
                        {getStatusText(channel.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{channel.subscribers.toLocaleString()} подписчиков</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>125 постов</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyId(channel.id)}
                        >
                          {copiedId === channel.id ? (
                            <>
                              <Check className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Открываем канал в Telegram
                            window.open(`https://t.me/${channel.username.replace('@', '')}`, '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Подключен: {new Date(channel.joined_at).toLocaleDateString('ru-RU')}
                      </span>
                      <Button variant="outline" size="sm">
                        Управление
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Radio className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Подключение каналов</h3>
                <p className="text-sm text-muted-foreground">
                  Подключите ваши Telegram каналы для управления контентом, аналитики и автоматизации.
                  Получайте уведомления о новых подписчиках и взаимодействии с аудиторией.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};