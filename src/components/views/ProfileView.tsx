import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, User, Coins, Shield, MessageSquare, Bot, Settings, Crown } from 'lucide-react';
import { useTelegramContext } from '@/components/TelegramProvider';
import { useProfile, ExtendedUserProfile } from '@/hooks/useProfile';
import { useSupportTickets, Ticket } from '@/hooks/useSupportTickets';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { BalanceCards } from '@/components/profile/BalanceCards';
import { ReferralSection } from '@/components/profile/ReferralSection';
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
  const { user: telegramUser, authProfile, authBalance, authReferralStats, authRole } = useTelegramContext();
  const {
    profile,
    balance,
    referralStats,
    vpnKey,
    channel,
    userBot,
    subscription,
    referralLink,
    isLoading,
    error,
    updateProfile
  } = useProfile();
  const { tickets, fetchTickets, updateTicketStatus } = useSupportTickets();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  const handleNavigate = (tab: string) => {
    onNavigate?.(tab);
  };

  const handleEnterAdminMode = () => {
    hapticFeedback('medium');
    onEnterAdminMode?.();
  };

  const isAdmin = authRole === 'admin';

  // Загружаем тикеты при загрузке профиля
  useEffect(() => {
    if (profile?.id) {
      fetchTickets(profile.id);
    }
  }, [profile?.id]); // Убираем fetchTickets из зависимостей, чтобы избежать бесконечного цикла

  // Проверяем, есть ли активные тикеты
  useEffect(() => {
    if (tickets && tickets.length > 0) {
      // Находим первый незакрытый тикет
      const openTicket = tickets.find(ticket => ticket.status !== 'closed');
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

  if (error && !authProfile) {
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

  // Используем данные из контекста, если хук не загрузил данные
  const displayProfile = profile || authProfile;
  const displayBalance = balance || authBalance;
  const displayReferralStats = referralStats || authReferralStats;

  const handleOpenTicket = (ticket: Ticket) => {
    setActiveTicket(ticket);
  };

  const handleCloseChat = () => {
    // Просто сбрасываем активный тикет, обновление статуса происходит в SupportChatView
    setActiveTicket(null);
  };

  return (
    <div className="px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 space-y-6"
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
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card rounded-2xl p-4 border border-border text-center cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setIsEditModalOpen(true)}
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs font-medium">О себе</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card rounded-2xl p-4 border border-border text-center cursor-pointer hover:bg-accent transition-colors"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-xs font-medium">Пополнить</p>
          </motion.div>
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
              className="w-full gold-gradient text-primary-foreground font-medium py-6"
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
          />
        )}

        {/* Support Ticket Button */}
        {(!activeTicket || activeTicket.status === 'closed') && (
          <div className="pt-4">
            <SupportTicketButton
              profileId={displayProfile?.id || null}
              onTicketCreated={() => {
                // Обновляем список тикетов при создании нового
                if (displayProfile?.id) {
                  fetchTickets(displayProfile.id);
                }
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
    </div>
  );
};
