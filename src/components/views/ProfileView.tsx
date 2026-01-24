import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, User, Coins, Settings, Crown } from 'lucide-react';
import { useTelegramContext } from '@/components/TelegramProvider';
import { useProfile, ExtendedUserProfile } from '@/hooks/useProfile';
import { useSupportTickets, Ticket } from '@/hooks/useSupportTickets';
import { InteractiveBackground } from '@/components/3d/InteractiveBackground';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { BalanceCards } from '@/components/profile/BalanceCards';

import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { SupportTicketButton } from '@/components/profile/SupportTicketButton';
import { VPNStatusCard } from '@/components/profile/VPNStatusCard';
import { ChannelStatusCard } from '@/components/profile/ChannelStatusCard';
import { BotStatusCard } from '@/components/profile/BotStatusCard';
import { UserInfoCard } from '@/components/profile/UserInfoCard';
import SupportChatView from '@/components/profile/SupportChatView';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { hapticFeedback } from '@/lib/telegram';

interface ProfileViewProps {
  onNavigate?: (tab: string) => void;
  onEnterAdminMode?: () => void;
}

export const ProfileView = ({ onNavigate, onEnterAdminMode }: ProfileViewProps) => {
  const { user: telegramUser, authProfile, authBalance, authRole } = useTelegramContext();
  const {
    profile,
    balance,
    vpnKey,
    channel,
    userBot,
    subscription,
    isLoading,
    error,
    updateProfile
  } = useProfile();
  const { tickets, fetchTickets } = useSupportTickets();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [newlyCreatedTicket, setNewlyCreatedTicket] = useState<Ticket | null>(null);

  const handleNavigate = (tab: string) => {
    onNavigate?.(tab);
  };

  const handleEnterAdminMode = () => {
    hapticFeedback('medium');
    onEnterAdminMode?.();
  };

  const isAdmin = authRole === 'admin';

  // Используем данные из контекста, если хук не загрузил данные
  const displayProfile = profile || authProfile;
  const displayBalance = balance || authBalance;

  // Загружаем тикеты при загрузке профиля (один раз)
  useEffect(() => {
    if (displayProfile?.id) {
      fetchTickets(displayProfile.id).catch(err => {
        console.error('Ошибка загрузки тикетов:', err);
      });
    }
  }, [displayProfile?.id]);

  // Проверяем, есть ли активные тикеты
  useEffect(() => {
    if (tickets && tickets.length > 0) {
      // Находим первый незакрытый тикет (не closed и не resolved)
      const openTicket = tickets.find(ticket => 
        ticket.status !== 'closed' && ticket.status !== 'resolved'
      );
      if (openTicket) {
        setActiveTicket(openTicket);
      } else {
        // Если нет незакрытых тикетов, сбрасываем активный тикет
        setActiveTicket(null);
      }
    } else {
      // Если нет тикетов вообще, сбрасываем активный тикет
      setActiveTicket(null);
    }
  }, [tickets]);

  if (isLoading) {
    return (
      <div className="px-4 pb-24 flex items-center justify-center min-h-[60vh]">
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
          <p className="text-muted-foreground">Загрузка профиля...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !displayProfile) {
    // Показываем ошибку только если нет профиля вообще (ни из API, ни из контекста)
    return (
      <div className="px-4 pb-24 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <User className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">Откройте приложение через Telegram бота</p>
        </motion.div>
      </div>
    );
  }

  if (!displayProfile) {
    return (
      <div className="px-4 pb-24 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/40 flex items-center justify-center">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">Профиль недоступен</p>
          <p className="text-sm text-muted-foreground">Пожалуйста, авторизуйтесь и попробуйте снова</p>
        </motion.div>
      </div>
    );
  }

  const handleCloseChat = async () => {
    // После закрытия тикета, обновляем список тикетов чтобы найти активный
    if (displayProfile?.id) {
      await fetchTickets(displayProfile.id);
    }
  };

  return (
    <InteractiveBackground className="px-4 pb-24" intensity={0.9}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 space-y-6 page-enter"
      >
        {/* Header */}
        <PageHeader
          icon="user"
          title="Личный кабинет"
          subtitle="Управление вашим профилем и настройками"
        />

        {/* Profile Header */}
        <ProfileHeader
          profile={displayProfile as ExtendedUserProfile}
          telegramUser={telegramUser}
          onEditClick={null} // Отключаем редактирование через ProfileHeader
        />

        {/* User Info Card */}
        <UserInfoCard profile={displayProfile as ExtendedUserProfile} />

        {/* Balance Cards */}
        <BalanceCards balance={displayBalance} />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="glass"
            className="h-20 w-full justify-start px-4"
            onClick={() => setIsEditModalOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/15 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">О себе</div>
                <div className="text-xs text-muted-foreground">Профиль и контакты</div>
              </div>
            </div>
          </Button>

          <Button
            variant="gradient"
            className="h-20 w-full justify-start px-4"
            onClick={() => hapticFeedback('medium')}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/15 flex items-center justify-center">
                <Coins className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Пополнить</div>
                <div className="text-xs text-white/80">Баланс и подписки</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Services Status Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold px-1 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Мои услуги
          </h2>

          {/* VPN Status */}
          <VPNStatusCard
            vpnKey={vpnKey}
            onNavigate={handleNavigate}
          />

          {/* Channel Status */}
          <ChannelStatusCard
            channel={channel}
            onNavigate={handleNavigate}
          />

          {/* Bot Status */}
          <BotStatusCard
            bot={userBot}
            subscriptionExpiresAt={subscription?.expires_at || null}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Admin Panel Button */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={handleEnterAdminMode}
              variant="gradient"
              className="w-full py-6"
            >
              <Crown className="w-5 h-5 mr-2" />
              Админ-панель
            </Button>
          </motion.div>
        )}

        {/* Support Chat View */}
        {displayProfile && (
          <SupportChatView
            activeTicket={activeTicket}
            onCloseChat={handleCloseChat}
            newlyCreatedTicket={newlyCreatedTicket}
          />
        )}

        {/* Support Ticket Button */}
        {(!activeTicket || activeTicket.status === 'closed') && (
          <div className="pt-4">
            <SupportTicketButton
              profileId={displayProfile?.id || null}
              onTicketCreated={(ticket) => {
                // Обновляем список тикетов при создании нового
                if (displayProfile?.id) {
                  fetchTickets(displayProfile.id);
                }
                // Сохраняем информацию о новом тикете для отображения уведомления
                setNewlyCreatedTicket(ticket);
              }}
            />
          </div>
        )}
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={displayProfile as ExtendedUserProfile}
        onSave={updateProfile}
      />
    </InteractiveBackground>
  );
};
