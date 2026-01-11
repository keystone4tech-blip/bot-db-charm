import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Plus, ExternalLink, Copy, Check, Users, MessageSquare, SkipForward, Flag, CheckCircle, CheckSquare, ChevronDown } from 'lucide-react';
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
  description: string;
  subscribers: number;
  status: 'active' | 'inactive' | 'pending' | 'banned';
  joined_at: string;
  is_required: boolean; // Обязательный канал для подписки
  is_referal?: boolean; // Реферальный канал
  is_paid?: boolean; // Платный канал
  is_new?: boolean; // Новенький канал
}

interface UserChannel {
  id: string;
  name: string;
  username: string;
  description: string;
  balance: number; // Баланс показов
  subscribers: number;
  status: 'active' | 'inactive' | 'pending';
}

export const ChannelsView = () => {
  const { authProfile } = useTelegramContext();
  const { profile, channel, isLoading, error } = useProfile();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [userChannel, setUserChannel] = useState<UserChannel | null>(null);
  const [completedRequiredSubscriptions, setCompletedRequiredSubscriptions] = useState<number>(0);
  const [totalRequiredSubscriptions, setTotalRequiredSubscriptions] = useState(15);
  const [expandedInfo, setExpandedInfo] = useState(false);
  const [subscribedChannels, setSubscribedChannels] = useState<Set<string>>(new Set());
  const [skippedChannels, setSkippedChannels] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddChannelForm, setShowAddChannelForm] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportChannelId, setReportChannelId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [checkedChannels, setCheckedChannels] = useState<Set<string>>(new Set());
  const [newChannel, setNewChannel] = useState({
    name: '',
    username: '',
    description: ''
  });

  // Используем данные из контекста, если хук не загрузил данные
  const displayProfile = profile || authProfile;

  // Загружаем каналы при загрузке компонента
  useEffect(() => {
    // В реальной реализации здесь будет загрузка каналов из API
    // Для демонстрации создадим фиктивные данные
    
    // Симулируем 15 обязательных каналов (5 реферальных, 5 платных, 5 новеньких)
    const mockChannels: Channel[] = [
      // Реферальные каналы (5 шт.)
      {
        id: 'ref1',
        name: 'Tech News Daily',
        username: '@technews_daily',
        description: 'Ежедневные новости технологий и IT',
        subscribers: 15000,
        status: 'active',
        joined_at: '2024-01-15T10:30:00Z',
        is_required: true,
        is_referal: true
      },
      {
        id: 'ref2',
        name: 'Crypto Insights',
        username: '@crypto_insights',
        description: 'Анализ криптовалютного рынка',
        subscribers: 8500,
        status: 'active',
        joined_at: '2024-01-20T14:45:00Z',
        is_required: true,
        is_referal: true
      },
      {
        id: 'ref3',
        name: 'AI Trends',
        username: '@ai_trends',
        description: 'Новости и тренды в области ИИ',
        subscribers: 12000,
        status: 'active',
        joined_at: '2024-01-25T09:15:00Z',
        is_required: true,
        is_referal: true
      },
      {
        id: 'ref4',
        name: 'Dev Digest',
        username: '@dev_digest',
        description: 'Еженедельный дайджест для разработчиков',
        subscribers: 7200,
        status: 'active',
        joined_at: '2024-02-01T11:30:00Z',
        is_required: true,
        is_referal: true
      },
      {
        id: 'ref5',
        name: 'Startup Stories',
        username: '@startup_stories',
        description: 'Истории успешных стартапов',
        subscribers: 9800,
        status: 'active',
        joined_at: '2024-02-05T16:20:00Z',
        is_required: true,
        is_referal: true
      },
      
      // Платные каналы (5 шт.)
      {
        id: 'paid1',
        name: 'Premium Tech',
        username: '@premium_tech',
        description: 'Эксклюзивные материалы о технологиях',
        subscribers: 25000,
        status: 'active',
        joined_at: '2024-01-10T08:00:00Z',
        is_required: true,
        is_paid: true
      },
      {
        id: 'paid2',
        name: 'Business Insider',
        username: '@business_insider',
        description: 'Бизнес новости и аналитика',
        subscribers: 18500,
        status: 'active',
        joined_at: '2024-01-12T12:15:00Z',
        is_required: true,
        is_paid: true
      },
      {
        id: 'paid3',
        name: 'Marketing Guru',
        username: '@marketing_guru',
        description: 'Советы по маркетингу и продвижению',
        subscribers: 14200,
        status: 'active',
        joined_at: '2024-01-18T15:40:00Z',
        is_required: true,
        is_paid: true
      },
      {
        id: 'paid4',
        name: 'Design Inspiration',
        username: '@design_inspiration',
        description: 'Ежедневные вдохновляющие дизайны',
        subscribers: 11500,
        status: 'active',
        joined_at: '2024-01-22T13:25:00Z',
        is_required: true,
        is_paid: true
      },
      {
        id: 'paid5',
        name: 'Finance Tips',
        username: '@finance_tips',
        description: 'Советы по финансам и инвестициям',
        subscribers: 22000,
        status: 'active',
        joined_at: '2024-01-28T10:10:00Z',
        is_required: true,
        is_paid: true
      },
      
      // Новенькие каналы (5 шт.)
      {
        id: 'new1',
        name: 'Fresh Tech Ideas',
        username: '@fresh_tech_ideas',
        description: 'Новые идеи в мире технологий',
        subscribers: 1200,
        status: 'active',
        joined_at: '2024-03-01T09:00:00Z',
        is_required: false,
        is_new: true
      },
      {
        id: 'new2',
        name: 'Code Tutorials',
        username: '@code_tutorials',
        description: 'Обучающие видео по программированию',
        subscribers: 850,
        status: 'active',
        joined_at: '2024-03-02T14:30:00Z',
        is_required: false,
        is_new: true
      },
      {
        id: 'new3',
        name: 'Gaming Updates',
        username: '@gaming_updates',
        description: 'Новости игровой индустрии',
        subscribers: 2100,
        status: 'active',
        joined_at: '2024-03-03T11:15:00Z',
        is_required: false,
        is_new: true
      },
      {
        id: 'new4',
        name: 'Health & Wellness',
        username: '@health_wellness',
        description: 'Советы по здоровому образу жизни',
        subscribers: 1800,
        status: 'active',
        joined_at: '2024-03-04T16:45:00Z',
        is_required: false,
        is_new: true
      },
      {
        id: 'new5',
        name: 'Travel Diaries',
        username: '@travel_diaries',
        description: 'Путешествия по всему миру',
        subscribers: 3200,
        status: 'active',
        joined_at: '2024-03-05T12:20:00Z',
        is_required: false,
        is_new: true
      }
    ];

    setChannels(mockChannels);
    
    // Проверяем, есть ли у пользователя канал
    if (channel) {
      const userChannelData: UserChannel = {
        id: channel.id,
        name: channel.channel_title || 'Мой канал',
        username: channel.channel_username || `@${channel.id}`,
        description: channel.description || 'Мой Telegram канал',
        balance: channel.subscription_balance || 0,
        subscribers: channel.subscribers_count || 0,
        status: channel.is_verified ? 'active' : 'pending'
      };
      setUserChannel(userChannelData);
    }
  }, [channel]);

  const handleSubscribe = async (channelId: string) => {
    // В реальной реализации здесь будет проверка подписки через Telegram API
    // Для демонстрации просто добавляем в список подписанных
    setSubscribedChannels(prev => new Set(prev).add(channelId));

    // Добавляем канал в список проверенных
    setCheckedChannels(prev => new Set(prev).add(channelId));

    // Если это обязательный канал, проверяем, все ли обязательные подписаны
    const channel = channels.find(c => c.id === channelId);
    if (channel?.is_required) {
      const allRequiredSubscribed = channels
        .filter(c => c.is_required)
        .every(c => subscribedChannels.has(c.id) || c.id === channelId);

      if (allRequiredSubscribed && channels.filter(c => c.is_required).length === 15) {
        // Все обязательные каналы подписаны, можно добавлять свой
        console.log('Все обязательные каналы подписаны!');
      }
    }
  };

  const handleSkip = (channelId: string) => {
    // Пропускать можно только новенькие каналы
    const channel = channels.find(c => c.id === channelId);
    if (channel?.is_new) {
      setSkippedChannels(prev => new Set(prev).add(channelId));
    }
  };

  const handleReport = (channelId: string) => {
    setReportChannelId(channelId);
    setReportModalOpen(true);
  };

  const submitReport = () => {
    if (!reportChannelId || !reportReason.trim()) return;

    // Отправляем жалобу админу
    console.log(`Жалоба на канал ${reportChannelId} отправлена админу`);
    console.log(`Причина: ${reportReason}`);

    const channel = channels.find(c => c.id === reportChannelId);
    if (channel?.is_required) {
      // Для обязательных каналов показываем уведомление, но не убирааем из списка
      alert('Жалоба отправлена. Обязательный канал останется в списке до решения администрации.');
    } else {
      // Для новеньких каналов заменяем на другой
      setChannels(prev =>
        prev.map(c =>
          c.id === reportChannelId
            ? { ...c, status: 'reported' } // Помечаем как пожалованный
            : c
        )
      );
    }

    // Закрываем модальное окно и очищаем форму
    setReportModalOpen(false);
    setReportReason('');
    setReportChannelId(null);
  };

  const handleAddChannel = async () => {
    if (!newChannel.name || !newChannel.username || !displayProfile?.id) {
      return;
    }

    // В реальной реализации здесь будет отправка запроса на добавление канала
    // Для демонстрации просто создаем фиктивный канал

    const newUserChannel: UserChannel = {
      id: `user_${Date.now()}`,
      name: newChannel.name,
      username: newChannel.username,
      description: newChannel.description,
      balance: 1, // Начисляем 1 балл за добавление
      subscribers: 0,
      status: 'pending'
    };

    setUserChannel(newUserChannel);
    setShowAddChannelForm(false);
    setNewChannel({ name: '', username: '', description: '' });
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
      case 'banned':
        return 'destructive';
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
      case 'banned':
        return 'Заблокирован';
      default:
        return 'Неизвестен';
    }
  };

  // Проверяем, сколько обязательных каналов подписано
  useEffect(() => {
    const requiredChannelsCount = channels.filter(c => c.is_required).length;
    const subscribedRequiredCount = channels.filter(c =>
      c.is_required && subscribedChannels.has(c.id)
    ).length;

    setCompletedRequiredSubscriptions(subscribedRequiredCount);
    setTotalRequiredSubscriptions(requiredChannelsCount);
  }, [channels, subscribedChannels]);

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

  // Разделяем каналы на обязательные и новенькие
  const requiredChannels = channels.filter(c => c.is_required);
  const newChannels = channels.filter(c => c.is_new && !skippedChannels.has(c.id));

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
        title="Подписки"
        subtitle="Помоги другим — получи помощь"
      />

      {/* Info Section - Moved to top and made expandable */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border-purple-500/20 cursor-pointer"
          onClick={() => setExpandedInfo(!expandedInfo)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Radio className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Как это работает</h3>
                  {!expandedInfo && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      Подпишитесь на 15 каналов, чтобы получить доступ к добавлению своего.
                      Зарабатывайте баллы, подписываясь на другие каналы.
                      1 балл = 1 показ вашего канала другому пользователю.
                    </p>
                  )}
                </div>
              </div>
              <div className={`transform transition-transform ${expandedInfo ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            {expandedInfo && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Подпишитесь на 15 каналов, чтобы получить доступ к добавлению своего.
                  Зарабатывайте баллы, подписываясь на другие каналы.
                  1 балл = 1 показ вашего канала другому пользователю.
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• 5 реферальных каналов</li>
                  <li>• 5 платных каналов</li>
                  <li>• 5 новичков каналов</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Bar for Required Subscriptions */}
      {requiredChannels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Обязательные подписки: {completedRequiredSubscriptions}/{totalRequiredSubscriptions}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((completedRequiredSubscriptions / totalRequiredSubscriptions) * 100)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5">
                <motion.div
                  className="bg-primary h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedRequiredSubscriptions / totalRequiredSubscriptions) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Required Channels Section */}
      {requiredChannels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold px-1 flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5" />
            Обязательные каналы ({requiredChannels.length})
          </h2>

          <div className="space-y-4">
            {requiredChannels.map((channel, index) => {
              const isSubscribed = subscribedChannels.has(channel.id);
              
              return (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={cn(
                    "overflow-hidden",
                    isSubscribed ? "border-primary/50 bg-primary/5" : ""
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Radio className="w-5 h-5 text-primary" />
                            {channel.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {channel.username}
                            </p>
                            <Badge variant={getStatusBadgeVariant(channel.status)}>
                              {getStatusText(channel.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {channel.description}
                          </p>
                        </div>
                        {isSubscribed && (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
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

                        {checkedChannels.has(channel.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Открываем канал в Telegram
                              window.open(`https://t.me/${channel.username.replace('@', '')}`, '_blank');
                            }}
                          >
                            Перейти
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Открываем канал в Telegram
                              window.open(`https://t.me/${channel.username.replace('@', '')}`, '_blank');
                            }}
                          >
                            Подписаться
                          </Button>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <div></div>

                        {checkedChannels.has(channel.id) ? (
                          <div></div> // Пустой div вместо кнопок после проверки
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSubscribe(channel.id)}
                            >
                              Проверить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReport(channel.id)}
                            >
                              Жалоба
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* New Channels Section */}
      {newChannels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold px-1 flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5" />
            Новенькие каналы ({newChannels.length})
          </h2>

          <div className="space-y-4">
            {newChannels.map((channel, index) => {
              const isSubscribed = subscribedChannels.has(channel.id);
              
              return (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (requiredChannels.length + index) * 0.05 }}
                >
                  <Card className={cn(
                    "overflow-hidden",
                    isSubscribed ? "border-primary/50 bg-primary/5" : ""
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Radio className="w-5 h-5 text-primary" />
                            {channel.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {channel.username}
                            </p>
                            <Badge variant={getStatusBadgeVariant(channel.status)}>
                              {getStatusText(channel.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {channel.description}
                          </p>
                        </div>
                        {isSubscribed && (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
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

                        {checkedChannels.has(channel.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Открываем канал в Telegram
                              window.open(`https://t.me/${channel.username.replace('@', '')}`, '_blank');
                            }}
                          >
                            Перейти
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Открываем канал в Telegram
                              window.open(`https://t.me/${channel.username.replace('@', '')}`, '_blank');
                            }}
                          >
                            Подписаться
                          </Button>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                        <div></div>

                        {checkedChannels.has(channel.id) ? (
                          <div></div> // Пустой div вместо кнопок после проверки
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSubscribe(channel.id)}
                            >
                              Проверить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSkip(channel.id)}
                            >
                              Пропустить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReport(channel.id)}
                            >
                              Жалоба
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Add User Channel Section */}
      {completedRequiredSubscriptions >= 15 && !userChannel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Добавить свой канал
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                После добавления канала вы получите 1 балл и сможете зарабатывать больше
              </p>
            </CardHeader>
            <CardContent>
              {showAddChannelForm ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="channelName" className="text-sm font-medium">Название канала</label>
                    <Input
                      id="channelName"
                      value={newChannel.name}
                      onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                      placeholder="Введите название вашего канала"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="channelUsername" className="text-sm font-medium">Имя пользователя</label>
                    <Input
                      id="channelUsername"
                      value={newChannel.username}
                      onChange={(e) => setNewChannel({...newChannel, username: e.target.value})}
                      placeholder="@your_channel_name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="channelDescription" className="text-sm font-medium">Описание</label>
                    <Input
                      id="channelDescription"
                      value={newChannel.description}
                      onChange={(e) => setNewChannel({...newChannel, description: e.target.value})}
                      placeholder="Краткое описание вашего канала"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleAddChannel}
                      disabled={!newChannel.name || !newChannel.username}
                    >
                      Добавить канал
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddChannelForm(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full gold-gradient text-primary-foreground font-medium py-6"
                  onClick={() => setShowAddChannelForm(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Добавить мой канал
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* User Channel Info */}
      {userChannel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-500" />
                Мой канал
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{userChannel.name}</h3>
                    <p className="text-sm text-muted-foreground">{userChannel.username}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(userChannel.status)}>
                    {getStatusText(userChannel.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-secondary/30 rounded-xl">
                    <div className="text-xl font-bold text-primary">{userChannel.subscribers.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Подписчики</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-xl">
                    <div className="text-xl font-bold text-green-500">{userChannel.balance}</div>
                    <div className="text-xs text-muted-foreground">Баланс показов</div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Описание:</p>
                  <p className="text-sm">{userChannel.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

    {/* Report Modal */}
    {reportModalOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl p-6 w-full max-w-md border border-border"
        >
          <h3 className="text-lg font-semibold mb-2">Отправить жалобу</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Вы хотите отправить жалобу на канал. Пожалуйста, опишите причину.
          </p>

          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Опишите причину жалобы..."
            className="w-full p-3 border border-border rounded-lg bg-background text-foreground text-sm mb-4 min-h-[100px]"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setReportModalOpen(false);
                setReportReason('');
                setReportChannelId(null);
              }}
            >
              Отмена
            </Button>
            <Button
              className="flex-1"
              onClick={submitReport}
              disabled={!reportReason.trim()}
            >
              Отправить
            </Button>
          </div>
        </motion.div>
      </div>
    )}
    </motion.div>
  );
};