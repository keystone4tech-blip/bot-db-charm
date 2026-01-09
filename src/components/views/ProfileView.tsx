import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, User, Coins, Shield, MessageSquare, Bot, Settings } from 'lucide-react';
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

interface ProfileViewProps {
  onNavigate?: (tab: string) => void;
}

export const ProfileView = ({ onNavigate }: ProfileViewProps) => {
  const { user: telegramUser, authProfile, authBalance, authReferralStats } = useTelegramContext();
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

  return (
    <div className="px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 space-y-6"
      >
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
