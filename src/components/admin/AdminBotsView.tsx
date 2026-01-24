import { motion } from 'framer-motion';
import { 
  Bot, 
  Power,
  Settings,
  Activity,
  Users,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/ui/PageHeader';

const mockBots = [
  {
    id: '1',
    name: 'Keystone Tech Bot',
    username: '@Keystone_Tech_Robot',
    isActive: true,
    users: 1234,
    messages: 45678,
    type: 'main'
  },
  { 
    id: '2', 
    name: 'Support Bot', 
    username: '@KS_Support_bot', 
    isActive: true, 
    users: 567,
    messages: 12345,
    type: 'support'
  },
  { 
    id: '3', 
    name: 'Notification Bot', 
    username: '@KS_Notify_bot', 
    isActive: false, 
    users: 890,
    messages: 5678,
    type: 'notification'
  },
];

export const AdminBotsView = () => {
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
            <p className="text-2xl font-bold text-primary">3</p>
            <p className="text-xs text-muted-foreground">Всего ботов</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-500">2</p>
            <p className="text-xs text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">1</p>
            <p className="text-xs text-muted-foreground">Выключено</p>
          </CardContent>
        </Card>
      </div>

      {/* Bots List */}
      <div className="space-y-4">
        {mockBots.map((bot, index) => (
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
                    <div className={`p-2 rounded-lg ${bot.isActive ? 'bg-green-500/10' : 'bg-muted'}`}>
                      <Bot className={`w-5 h-5 ${bot.isActive ? 'text-green-500' : 'text-muted-foreground'}`} />
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
                    <Switch checked={bot.isActive} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{bot.users.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Пользователей</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{bot.messages.toLocaleString()}</p>
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
