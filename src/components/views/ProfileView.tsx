import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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
  const { user: telegramUser } = useTelegramContext();
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
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка профиля...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="px-4 pb-24 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">Откройте приложение через Telegram бота</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 space-y-4"
      >
        {/* Profile Header */}
        <ProfileHeader 
          profile={profile}
          telegramUser={telegramUser}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        {/* Balance Cards */}
        <BalanceCards balance={balance} />

        {/* Services Status Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold px-1">Мои услуги</h2>
          
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

        {/* Referral Section with Chart */}
        <ReferralSection 
          referralLink={referralLink}
          referralStats={referralStats}
        />

        {/* Support Ticket Button */}
        <SupportTicketButton profileId={profile?.id || null} />
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={updateProfile}
      />
    </div>
  );
};
