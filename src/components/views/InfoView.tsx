import { motion } from 'framer-motion';
import { Bot, Rocket, Users, MessageSquare, Zap, Shield, ChevronRight, Sparkles, Target, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

const features = [
  {
    icon: Rocket,
    title: 'Автопостинг',
    description: 'Автоматическое размещение постов и рекламных материалов по расписанию',
  },
  {
    icon: Users,
    title: 'Привлечение аудитории',
    description: 'Органический рост подписчиков через умную систему продвижения',
  },
  {
    icon: MessageSquare,
    title: 'Реферальные боты',
    description: 'Создание персональных ботов для вашего канала с реферальной системой',
  },
  {
    icon: Zap,
    title: 'Быстрый старт',
    description: 'Простая настройка и мгновенный запуск без технических знаний',
  },
  {
    icon: Shield,
    title: 'Безопасность',
    description: 'Защита данных и безопасные методы продвижения',
  },
  {
    icon: Sparkles,
    title: 'ИИ-анализ',
    description: 'Умный анализ аудитории и оптимизация контента с помощью ИИ',
  },
  {
    icon: Target,
    title: 'Таргетинг',
    description: 'Точный таргетинг рекламы по интересам и поведению аудитории',
  },
  {
    icon: TrendingUp,
    title: 'Аналитика',
    description: 'Подробная аналитика эффективности кампаний и роста аудитории',
  },
];

const stats = [
  { value: '15K+', label: 'Пользователей' },
  { value: '1M+', label: 'Постов' },
  { value: '5M+', label: 'Охват' },
  { value: '98%', label: 'Удовлетворенность' },
  { value: '24/7', label: 'Поддержка' },
  { value: '100%', label: 'Безопасность' },
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

export const InfoView = () => {
  return (
    <motion.div
      className="px-4 py-6 pb-24 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <PageHeader
        icon="rocket"
        title="TG Автоматизация"
        subtitle="Умное продвижение вашего Telegram канала"
      />

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-3 gap-3"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="stat-card-light bg-gradient-to-br from-card via-card to-primary/10 p-4 rounded-2xl border border-border text-center shadow-sm dark:shadow-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <motion.div
              className="text-xl font-bold stat-number gold-gradient-text mb-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
            >
              {stat.value}
            </motion.div>
            <div className="text-xs text-muted-foreground font-medium">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

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
          Готовы начать?
        </motion.h3>
        <motion.p
          className="text-muted-foreground mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          Присоединяйтесь к тысячам успешных владельцев Telegram-каналов
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <button className="gold-gradient text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
            Начать бесплатно
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};