import { motion } from 'framer-motion';
import { PlusCircle, Send, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { hapticFeedback } from '@/lib/telegram';
import { PageHeader } from '@/components/ui/PageHeader';
import { useTelegramContext } from '@/components/TelegramProvider';
import { useState, useEffect } from 'react';
import {
  getActiveCampaigns,
  getScheduledPosts,
  getWeeklyStats
} from '@/lib/api';

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

export const PromotionView = () => {
  const { authProfile } = useTelegramContext();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [weekStats, setWeekStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!authProfile?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Загружаем все данные параллельно
        const [campaignsData, postsData, statsData] = await Promise.all([
          getActiveCampaigns(authProfile.id),
          getScheduledPosts(authProfile.id),
          getWeeklyStats(authProfile.id)
        ]);

        setCampaigns(campaignsData);
        setScheduledPosts(postsData);
        setWeekStats(statsData);
      } catch (err) {
        console.error('Ошибка загрузки данных продвижения:', err);
        setError('Ошибка загрузки данных');

        // В случае ошибки устанавливаем пустые массивы, чтобы не отображались фиктивные данные
        setCampaigns([]);
        setScheduledPosts([]);
        setWeekStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authProfile?.id]);

  const handleNewPost = () => {
    hapticFeedback('medium');
  };

  const handleAds = () => {
    hapticFeedback('medium');
  };

  if (loading) {
    return (
      <motion.div
        className="px-4 py-6 pb-24 flex items-center justify-center min-h-[60vh]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <div className="w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
          <p className="text-muted-foreground">Загрузка данных продвижения...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="px-4 py-6 pb-24 flex items-center justify-center min-h-[60vh]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-destructive mb-2">Ошибка загрузки данных</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="px-4 py-6 pb-24 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <PageHeader
        icon="megaphone"
        title="Продвижение"
        subtitle="Управляйте рекламой и постами"
      />

      {/* Action buttons */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleNewPost}
          className="bg-card border-2 border-primary/50 rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-primary transition-all duration-300 group"
        >
          <div className="icon-container group-hover:animate-pulse-gold">
            <PlusCircle className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold">Новый пост</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleAds}
          className="bg-card border-2 border-border rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-primary/50 transition-all duration-300 group"
        >
          <div className="icon-container">
            <Send className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold">Реклама</span>
        </motion.button>
      </motion.div>

      {/* Active campaigns */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Активные кампании</h3>
        </div>

        <div className="space-y-3">
          {campaigns.length > 0 ? (
            campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${campaign.status === 'active' ? 'bg-success animate-pulse' : 'bg-warning'}`} />
                  <div>
                    <p className="font-medium">{campaign.title}</p>
                    <p className="text-xs text-muted-foreground">{campaign.startedAt}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${campaign.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`}>
                  {campaign.result}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Нет активных кампаний</p>
              <p className="text-sm mt-1">Создайте первую кампанию продвижения</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Scheduled posts */}
      <motion.div variants={itemVariants} className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Запланированные посты</h3>
        </div>

        <div className="space-y-3">
          {scheduledPosts.length > 0 ? (
            scheduledPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ x: 4 }}
                className="p-3 bg-secondary/50 rounded-xl cursor-pointer hover:bg-secondary transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {post.description}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-lg shrink-0">
                    {post.time}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Нет запланированных постов</p>
              <p className="text-sm mt-1">Создайте первый запланированный пост</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Week stats */}
      <motion.div
        variants={itemVariants}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Статистика за неделю</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {weekStats.length > 0 ? (
            weekStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <motion.div
                  className="text-xl font-bold gold-gradient-text"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-6 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Нет статистики за неделю</p>
              <p className="text-sm mt-1">Статистика появится после запуска кампаний</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};