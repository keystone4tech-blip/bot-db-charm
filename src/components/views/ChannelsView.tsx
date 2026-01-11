import { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Users, MessageSquare, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';

export const ChannelsView = () => {
  const [channels] = useState([
    { id: '1', name: 'Keystone Tech News', username: '@keystonetech_news', subscribers: 12500, status: 'active' },
    { id: '2', name: 'Tech Reviews', username: '@tech_reviews', subscribers: 8750, status: 'active' },
    { id: '3', name: 'Daily Tech Tips', username: '@daily_tech_tips', subscribers: 5400, status: 'pending' }
  ]);

  return (
    <div className="px-4 py-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 space-y-6"
      >
        {/* Header */}
        <PageHeader
          icon="radio"
          title="Мои каналы"
          subtitle="Управление вашими Telegram каналами"
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{channels.length}</div>
              <div className="text-sm text-muted-foreground">Каналов</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">
                {channels.reduce((sum, channel) => sum + channel.subscribers, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Подписчиков</div>
            </CardContent>
          </Card>
        </div>

        {/* Channels List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold px-1 flex items-center gap-2">
            <Radio className="w-5 h-5" />
            Подключенные каналы
          </h2>

          {channels.map((channel, index) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Radio className="w-5 h-5 text-primary" />
                        {channel.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {channel.username}
                      </p>
                    </div>
                    <Badge variant={channel.status === 'active' ? 'default' : 'outline'}>
                      {channel.status === 'active' ? 'Активен' : 'На проверке'}
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
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(channel.id)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://t.me/${channel.username.replace('@', '')}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Add Channel Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-4">
              <Button className="w-full gold-gradient text-primary-foreground font-medium py-6">
                <Radio className="w-5 h-5 mr-2" />
                Подключить канал
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
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
                    Подключите ваши Telegram каналы для управления и аналитики.
                    Получайте уведомления о новых подписчиках и взаимодействии с аудиторией.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};