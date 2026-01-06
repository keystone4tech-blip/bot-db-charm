import { motion } from 'framer-motion';
import { Bot, Rocket, Users, MessageSquare, Zap, Shield, ChevronRight } from 'lucide-react';

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
];

const stats = [
  { value: '10K+', label: 'Пользователей' },
  { value: '500K+', label: 'Постов' },
  { value: '2M+', label: 'Охват' },
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
      {/* Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="text-center py-8"
      >
        <motion.div
          className="icon-container-lg mx-auto mb-6"
          animate={{ 
            boxShadow: [
              '0 0 20px hsl(45 93% 47% / 0.2)',
              '0 0 40px hsl(45 93% 47% / 0.4)',
              '0 0 20px hsl(45 93% 47% / 0.2)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Bot className="w-12 h-12 text-primary" />
        </motion.div>
        <motion.h1 
          className="text-2xl font-bold mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          TG Автоматизация
        </motion.h1>
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Умное продвижение вашего Telegram канала
        </motion.p>
      </motion.div>

      {/* Features */}
      <motion.div className="space-y-3" variants={containerVariants}>
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
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
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

      {/* Stats */}
      <motion.div
        variants={itemVariants}
        className="bg-card rounded-2xl p-6 border border-border"
      >
        <h3 className="text-center font-semibold text-lg mb-6">Наши достижения</h3>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <motion.div
                className="text-2xl font-bold gold-gradient-text"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};