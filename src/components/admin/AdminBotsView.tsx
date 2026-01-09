import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Power,
  Settings,
  Activity,
  Users,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { getAdminBots } from '@/lib/adminApi';

export const AdminBotsView = () => {
  const [bots, setBots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        setIsLoading(true);
        const data = await getAdminBots();
        setBots(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки ботов');
        console.error('Ошибка загрузки ботов:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBots();
  }, []);

  const activeBots = bots.filter(bot => bot.isActive).length;
  const inactiveBots = bots.filter(bot => !bot.isActive).length;

  if (isLoading) {
    return (
      <div className="px-4 pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4"
          >
            <Loader2 className="w-8 h-8 text-primary" />
          </motion.div>
          <p className="text-muted-foreground">Загрузка ботов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-destructive mb-2">Ошибка загрузки ботов</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24">
      <PageHeader
        icon="bot"
        title="Боты"
        subtitle="Управление Telegram ботами"
      />

      {/* Bot Stats Overview */}
      <div className="grid grid-cols-3 gap-3 mt-6 mb-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{bots.length}</p>
            <p className="text-xs text-muted-foreground">Всего ботов</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-500">{activeBots}</p>
            <p className="text-xs text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{inactiveBots}</p>
            <p className="text-xs text-muted-foreground">Выключено</p>
          </CardContent>
        </Card>
      </div>

      {/* Bots List */}
      <div className="space-y-4">
        {bots.map((bot, index) => (
          <motion.div
            key={bot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bot.isActive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      <Bot className={`w-5 h-5 ${bot.isActive ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{bot.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{bot.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={bot.isActive ? 'default' : 'secondary'}>
                      {bot.isActive ? 'Активен' : 'Выключен'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{bot.usersCount?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-muted-foreground">Пользователей</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{bot.messagesCount?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-muted-foreground">Сообщений</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Настройки
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Activity className="w-4 h-4 mr-2" />
                    Логи
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
