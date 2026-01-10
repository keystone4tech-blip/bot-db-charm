import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, User, Coins, Shield, MessageSquare, Bot, Settings, Crown } from 'lucide-react';
import { useTelegramContext } from '@/components/TelegramProvider';
import { useProfile } from '@/hooks/useProfile';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { BalanceCards } from '@/components/profile/BalanceCards';
import { ReferralSection } from '@/components/profile/ReferralSection';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { SupportTicketButton } from '@/components/profile/SupportTicketButton';
import { VPNStatusCard } from '@/components/profile/VPNStatusCard';
import { ChannelStatusCard } from '@/components/profile/ChannelStatusCard';
import { BotStatusCard } from '@/components/profile/BotStatusCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import { hapticFeedback } from '@/lib/telegram';

interface ProfileViewProps {
  onNavigate?: (tab: string) => void;
  onEnterAdminMode?: () => void;
}

export const ProfileView = memo(({ onNavigate, onEnterAdminMode }: ProfileViewProps) => {
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleNavigate = (tab: string) => {
    onNavigate?.(tab);
  };

  const handleEnterAdminMode = () => {
    hapticFeedback('medium');
    onEnterAdminMode?.();
  };

  const isAdmin = authRole === 'admin';

  if (isLoading) {
    return (
      <div className="px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 space-y-6"
        >
          {/* Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Profile Header Skeleton */}
          <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="w-10 h-10 rounded-lg" />
          </div>

          {/* Balance Cards Skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>

          {/* Services Status Section Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>

          {/* Admin Panel Button Skeleton */}
          {isAdmin && <Skeleton className="h-14 rounded-2xl" />}

          {/* Support Ticket Button Skeleton */}
          <Skeleton className="h-12 rounded-2xl mt-4" />
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
          profile={displayProfile}
          telegramUser={telegramUser}
          onEditClick={() => setIsEditModalOpen(true)}
        />

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
            <p className="text-xs font-medium">Редактировать</p>
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

        {/* Support Ticket Button */}
        <div className="pt-4">
          <SupportTicketButton profileId={displayProfile?.id || null} />
        </div>
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={displayProfile}
        onSave={updateProfile}
      />
    </div>
  );
};

export default ProfileView;
