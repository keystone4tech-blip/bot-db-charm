import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Plus, ExternalLink, Copy, Check, Users, MessageSquare, SkipForward, Flag, CheckCircle, CheckSquare, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { useTelegramContext } from '@/components/TelegramProvider';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
// Recommended channels loaded from Supabase (stub for now)

interface Channel {
  id: string;
  name: string;
  username: string;
  description: string;
  subscribers: number;
  status: 'active' | 'inactive' | 'pending' | 'banned' | 'reported';
  joined_at: string;
  is_required: boolean;
  is_referal?: boolean;
  is_paid?: boolean;
  is_new?: boolean;
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
  const [shouldScrollToAddChannel, setShouldScrollToAddChannel] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [newChannel, setNewChannel] = useState({
    name: '',
    username: '',
    description: ''
  });

  // Используем данные из контекста, если хук не загрузил данные
  const displayProfile = profile || authProfile;

  // Загружаем каналы при загрузке компонента
  useEffect(() => {
    // Загружаем рекомендованные каналы из API
    const fetchRecommendedChannels = async () => {
      try {
        // В реальной реализации здесь будет вызов API для получения списка каналов
        const loadedChannels: any[] = []; // TODO: load from Supabase
        setChannels(loadedChannels);

        // Проверяем, есть ли у пользователя канал
        if (channel) {
          const userChannelData: UserChannel = {
            id: channel.id,
            name: channel.channel_title || 'Мой канал',
            username: channel.channel_username || `@${channel.id}`,
            description: 'Мой Telegram канал',
            balance: 0,
            subscribers: channel.subscribers_count || 0,
            status: channel.is_verified ? 'active' : 'pending'
          };
          setUserChannel(userChannelData);
        }
      } catch (error) {
        console.error('Ошибка загрузки каналов:', error);
        // В случае ошибки можно установить пустой массив или обработать ошибку каким-то образом
        setChannels([]);
      }
    };

    fetchRecommendedChannels();
  }, [channel]);

  const handleSubscribe = async (channelId: string) => {
    // В реальной реализации здесь будет проверка подписки через Telegram API
    // Для демонстрации просто добавляем в список подписанных
    setSubscribedChannels(prev => new Set(prev).add(channelId));

    // Добавляем канал в список проверенных
    setCheckedChannels(prev => new Set(prev).add(channelId));

    // Проверяем, достигли ли мы 15 подписок
    const newSubscribedCount = Array.from(new Set([...subscribedChannels, channelId])).length;
    if (newSubscribedCount >= 15 && !userChannel) {
      setShouldScrollToAddChannel(true);
    }
  };

  const handleSkip = (channelId: string) => {
    // Пропускать можно только новенькие каналы
    const channel = channels.find(c => c.id === channelId);
    if (channel?.is_new) {
      setSkippedChannels(prev => new Set(prev).add(channelId));

      // Проверяем, достигли ли мы 15 подписок
      const newSubscribedCount = Array.from(subscribedChannels).length;
      if (newSubscribedCount >= 15 && !userChannel) {
        setShouldScrollToAddChannel(true);
      }
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

  const handleTopicChange = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleAddChannel = async () => {
    if (!newChannel.name || !newChannel.username || !displayProfile?.id || selectedTopics.length === 0) {
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
    setSelectedTopics([]); // Очищаем выбранные тематики
    // Сбрасываем флаг прокрутки, так как канал уже добавлен
    setShouldScrollToAddChannel(false);
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

  // Проверяем, сколько каналов подписано (все 15: 5 реферальных + 5 платных + 5 новичков)
  useEffect(() => {
    const allSubscribedCount = Array.from(subscribedChannels).length;

    setCompletedRequiredSubscriptions(allSubscribedCount);
    setTotalRequiredSubscriptions(15);

    // Если достигли 15 подписок и еще не отображается форма добавления канала
    if (allSubscribedCount >= 15 && !userChannel) {
      setShouldScrollToAddChannel(true);
    }
  }, [subscribedChannels, skippedChannels, userChannel]);

  // Эффект для прокрутки к секции добавления канала
  useEffect(() => {
    if (shouldScrollToAddChannel) {
      // Ждем немного, чтобы компонент отрисовался
      setTimeout(() => {
        const element = document.getElementById('add-channel-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setShouldScrollToAddChannel(false);
        }
      }, 100);
    }
  }, [shouldScrollToAddChannel]);

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
            <Loader2 className="w-full h-full text-primary" />
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
        title="Подписки"
        subtitle="Помоги другим — получи помощь"
      />

      {/* Info Section - Simplified version with button to open full modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Radio className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Как это работает</h3>
                <p className="text-sm text-muted-foreground">
                  Подпишитесь на 15 каналов, чтобы получить доступ к добавлению своего.
                  Зарабатывайте баллы, подписываясь на другие каналы.
                  1 балл = 1 показ вашего канала другому пользователю.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setExpandedInfo(true)}
                >
                  Читать подробнее
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Full-screen modal for detailed info */}
      {expandedInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Как это работает</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedInfo(false)}
              >
                Свернуть
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="mb-2"><strong>ИТОГО: 62 подписчика на твой канал или группу</strong> — <strong>без единого рубля</strong> и без дополнительных усилий!</p>

              <p className="mb-2">💡 А теперь представь, что вместо 2 друзей ты поделишься с 5 или 10. Даже если каждый из них пригласит всего 2 человека, результат будет колоссальным:</p>

              <table className="mb-2 w-full border-collapse border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-secondary">
                    <th className="border border-border p-2 text-left">Количество приглашённых</th>
                    <th className="border border-border p-2 text-left"><strong>Подписчики</strong> с 5 уровней</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-2">2</td>
                    <td className="border border-border p-2">62</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-2">5</td>
                    <td className="border border-border p-2">3905</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-2">10</td>
                    <td className="border border-border p-2">399 990</td>
                  </tr>
                </tbody>
              </table>

              <p className="mb-2">💥 Да, при 10 друзьях и 10% активности (каждый приглашает 2 человека), ты можешь получить <strong>почти 400 тысяч подписчиков</strong>!</p>

              <h4 className="font-semibold mt-3 mb-1">Почему это работает?</h4>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li><strong>Ты не платишь</strong> за подписчиков — всё бесплатно.</li>
                <li><strong>Ты контролируешь</strong> рост — просто разделяя ссылку.</li>
                <li><strong>Ты получаешь</strong> реальных подписчиков — они пришли, потому что кто-то им доверяет.</li>
              </ul>

              <hr className="my-3 border-border" />

              <h4 className="font-semibold mt-3 mb-1">💎 Этап 3: Добавь свой канал или группу и начни зарабатывать баллы</h4>
              <p className="mb-2">После того, как ты выполнил обязательные 15 подписок — можешь добавить свой канал или группу.</p>

              <h5 className="font-semibold mt-2 mb-1">Что такое баллы?</h5>
              <p className="mb-2">Это твоя валюта в системе. Каждый балл = <strong>один показ твоего канала или группы другому пользователю</strong>.</p>

              <h5 className="font-semibold mt-2 mb-1">Как заработать больше баллов?</h5>
              <p className="mb-2">Просто продолжай помогать другим:</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Подписывайся на дополнительные каналы/группы → +1 балл за каждую подтверждённую подписку.</li>
                <li>Чем больше ты помогаешь — тем больше показов получает твой канал или группа.</li>
              </ul>

              <h5 className="font-semibold mt-2 mb-1">Что происходит, когда кто-то подписывается на твой канал или группу?</h5>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>У тебя списывается 1 балл.</li>
                <li>Ты получаешь +1 реального подписчика.</li>
                <li>Если этот человек потом отпишется — балл вернётся к тебе, а подписчик исключится из статистики.</li>
              </ul>

              <p className="mb-2">💡 Это не игра с цифрами — это реальные люди, которые подписались на тебя, потому что ты помог другим.</p>

              <hr className="my-3 border-border" />

              <h4 className="font-semibold mt-3 mb-1">⚙️ Этап 4: Автоматическая проверка и справедливость</h4>
              <p className="mb-2">Бот регулярно проверяет, остаются ли все подписки активными. Если кто-то отписался — балл списывается, подписчик удаляется из статистики.</p>

              <p className="mb-2">Так мы сохраняем честность и предотвращаем обман.</p>

              <hr className="my-3 border-border" />

              <h4 className="font-semibold mt-3 mb-1">📊 Итог: как всё работает шаг за шагом</h4>
              <ol className="list-decimal pl-5 space-y-1 mb-2">
                <li><strong>Подпишись на 15 каналов/групп</strong> — помоги другим.</li>
                <li><strong>Добавь свой канал или группу</strong>.</li>
                <li><strong>Поделись ссылкой</strong> — получи <strong>вирусный рост</strong> благодаря реферальной системе.</li>
                <li><strong>Зарабатывай баллы</strong> — подписываясь на другие каналы/группы.</li>
                <li><strong>Получай подписчиков</strong> — когда другие пользователи видят твой канал или группу и подписываются.</li>
              </ol>

              <hr className="my-3 border-border" />

              <h4 className="font-semibold mt-3 mb-1">💡 Почему это работает?</h4>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li><strong>Честно</strong>: баллы = реальные подписки. Никакой фейковой статистики.</li>
                <li><strong>Мотивирует</strong>: чем больше ты помогаешь — тем больше получаешь.</li>
                <li><strong>Вирусно</strong>: твоя сеть растёт экспоненциально.</li>
                <li><strong>Устойчиво</strong>: система саморегулируется — отписка = штраф.</li>
              </ul>

              <blockquote className="border-l-4 border-primary pl-3 italic mt-2">
                <p>Ты не просто участник — ты часть сообщества, где каждый помогает друг другу расти. Начни сегодня — и уже завтра твой канал или группа может получить сотни, а то и тысячи новых подписчиков. 💪</p>
                <p className="mt-1"><em>P.S. Не забудь поделиться своей реферальной ссылкой — это твой ключ к бесплатному и вирусному росту!</em></p>
              </blockquote>

              <hr className="my-3 border-border" />

              <blockquote className="border-l-4 border-primary pl-3 italic mt-2">
                💡 Отписка от канала, за который ты получил балл — влечёт за собой возврат балла и удаление подписчика.
              </blockquote>

              <hr className="my-3 border-border" />

              <h4 className="font-semibold mt-3 mb-1">💳 Альтернатива: покупка показов</h4>
              <p className="mb-2">Если ты хочешь получить подписчиков без минимальных действий:</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li>Не подписываться на 15 каналов/групп</li>
                <li>Не делиться своей реферальной ссылкой на бота</li>
              </ul>

              <p className="mb-2">Ты можешь <strong>приобрести пакет показов</strong> за отдельную плату. Это позволяет получить подписчиков напрямую.</p>

              <hr className="my-3 border-border" />

              <h4 className="font-semibold mt-3 mb-1">📊 Итог: как всё работает шаг за шагом</h4>
              <ol className="list-decimal pl-5 space-y-1 mb-2">
                <li><strong>Сделай минимум</strong> → Подпишись на 15 → получи доступ.</li>
                <li><strong>Добавь свой ресурс</strong> → начни получать подписчиков.</li>
                <li><strong>Поделись своей реферальной ссылкой на бота</strong> → активируй вирусный рост (максимум!).</li>
                <li><strong>Подписывайся на других</strong> → зарабатывай баллы.</li>
                <li><strong>Получай подписчиков</strong> → через баллы и реферальную сеть.</li>
              </ol>

              <p className="mb-2">Или: <strong>купить показы</strong> → получить подписчиков напрямую.</p>

              <hr className="my-3 border-border" />

              <h4 className="font-semibold mt-3 mb-1">💡 Почему это работает?</h4>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                <li><strong>Просто</strong>: делай минимум — получай максимум.</li>
                <li><strong>Честно</strong>: система саморегулируема, отписка влечёт штраф.</li>
                <li><strong>Вирусно</strong>: реферальная сеть до 5 уровней — это твой автоматический рост.</li>
                <li><strong>Гибко</strong>: можно участвовать по минимуму или купить показы.</li>
              </ul>

              <blockquote className="border-l-4 border-primary pl-3 italic mt-2">
                <p>Ты не просто участник — ты часть системы, где <strong>минимальные действия</strong> приносят <strong>максимальный результат</strong>. 💪</p>
                <p className="mt-1"><em>P.S. Поделись своей реферальной ссылкой на бота — и умножь свой рост!</em></p>
              </blockquote>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add User Channel Section - Moved here to appear after "How it works" section */}
      {completedRequiredSubscriptions >= 15 && !userChannel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          id="add-channel-section"
        >
          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Добавить свой канал/группу
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                После добавления канала/группы вы получите 1 балл и сможете зарабатывать больше
              </p>
            </CardHeader>
            <CardContent>
              {showAddChannelForm ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="channelName" className="text-sm font-medium">Название канала/группы</label>
                    <Input
                      id="channelName"
                      value={newChannel.name}
                      onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                      placeholder="Введите название вашего канала или группы"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="channelUsername" className="text-sm font-medium">Ссылка на канал/группу</label>
                    <Input
                      id="channelUsername"
                      value={newChannel.username}
                      onChange={(e) => setNewChannel({...newChannel, username: e.target.value})}
                      placeholder="https://t.me/your_channel_name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="channelDescription" className="text-sm font-medium">Описание</label>
                    <Input
                      id="channelDescription"
                      value={newChannel.description}
                      onChange={(e) => setNewChannel({...newChannel, description: e.target.value})}
                      placeholder="Краткое описание вашего канала или группы"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Тематика канала/группы</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Технологии', 'Бизнес', 'Маркетинг', 'Образование',
                        'Здоровье', 'Спорт', 'Путешествия', 'Еда',
                        'Искусство', 'Музыка', 'Фотография', 'Видеоигры',
                        'Криптовалюты', 'Финансы', 'Политика', 'Наука',
                        'Психология', 'Мода', 'Дизайн', 'Продуктивность'
                      ].map((topic) => (
                        <div key={topic} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`topic-${topic}`}
                            checked={selectedTopics.includes(topic)}
                            onChange={() => handleTopicChange(topic)}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor={`topic-${topic}`} className="text-sm">
                            {topic}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleAddChannel}
                      disabled={!newChannel.name || !newChannel.username || selectedTopics.length === 0}
                    >
                      Добавить канал/группу
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
                  Добавить мой канал/группу
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* User Channel Info - Moved between "How it works" and progress bar */}
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
                Мой канал/группа
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

      {/* Progress Bar for Required Subscriptions */}
      {channels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Подписки: {completedRequiredSubscriptions}/{totalRequiredSubscriptions}
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

      {/* All Channels Section */}
      {channels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold px-1 flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5" />
            Каналы для подписки ({channels.length})
          </h2>

          <div className="space-y-4">
            {channels.map((channel, index) => {
              const isSubscribed = subscribedChannels.has(channel.id);
              const isNewChannel = channel.is_new;

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
                            {isNewChannel && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSkip(channel.id)}
                              >
                                Пропустить
                              </Button>
                            )}
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