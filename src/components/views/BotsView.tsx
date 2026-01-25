import { motion } from 'framer-motion';
import { Bot, Zap, Users, MessageSquare, Shield, ChevronRight, Sparkles, Target, TrendingUp, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Bot,
    title: 'Создание ботов',
    description: 'Создавайте собственных Telegram-ботов с уникальными возможностями',
  },
  {
    icon: Zap,
    title: 'Быстрая настройка',
    description: 'Настройте бота за несколько минут без знаний программирования',
  },
  {
    icon: Users,
    title: 'Привлечение аудитории',
    description: 'Используйте ботов для привлечения подписчиков на ваши каналы',
  },
  {
    icon: MessageSquare,
    title: 'Рассылки',
    description: 'Отправляйте сообщения вашей аудитории через ботов',
  },
  {
    icon: Shield,
    title: 'Безопасность',
    description: 'Все боты соответствуют политике безопасности Telegram',
  },
  {
    icon: Sparkles,
    title: 'ИИ-функции',
    description: 'Добавьте интеллектуальные ответы с помощью ИИ',
  },
  {
    icon: Target,
    title: 'Таргетинг',
    description: 'Настройте таргетинг сообщений по интересам пользователей',
  },
  {
    icon: TrendingUp,
    title: 'Аналитика',
    description: 'Отслеживайте эффективность ваших ботов',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

import { useProfile } from '@/hooks/useProfile';

export const BotsView = () => {
  const { userBot, isLoading, error } = useProfile();

  return (
    <motion.div
      className="px-4 py-6 pb-24 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <PageHeader
        icon="bot"
        title="Боты"
        subtitle="Создание и управление Telegram-ботами"
      />

      {/* User Bot Info */}
      {userBot && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-500" />
                Мой бот
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{userBot.bot_name}</h3>
                    <p className="text-sm text-muted-foreground">{userBot.bot_username}</p>
                  </div>
                  <Badge variant={userBot.is_active ? 'default' : 'secondary'}>
                    {userBot.is_active ? 'Активен' : 'Неактивен'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-secondary/30 rounded-xl">
                    <div className="text-xl font-bold text-primary">
                      {userBot.subscribers_count || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Подписчики</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-xl">
                    <div className="text-xl font-bold text-green-500">
                      {userBot.messages_sent || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Сообщений</div>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Описание:</p>
                  <p className="text-sm">{userBot.description || 'Нет описания'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Features */}
      <motion.div className="space-y-3" variants={containerVariants}>
        <h2 className="text-xl font-bold px-1 mb-4">Возможности</h2>
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="icon-container shrink-0 group-hover:animate-pulse-gold transition-all">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    {index < 3 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Популярное
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-border text-center"
      >
        <motion.h3
          className="text-xl font-bold mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {userBot ? 'Управление ботом' : 'Создать бота'}
        </motion.h3>
        <motion.p
          className="text-muted-foreground mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {userBot
            ? 'Управляйте вашим Telegram-ботом и отслеживайте статистику'
            : 'Начните создавать вашего первого Telegram-бота прямо сейчас'}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Button className="gold-gradient text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
            {userBot ? 'Управление' : 'Создать бота'}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};