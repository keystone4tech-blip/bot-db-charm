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

export const ProfileView = () => {
  const { user: telegramUser } = useTelegramContext();
  const { profile, balance, referralStats, referralLink, isLoading, error, updateProfile } = useProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        className="mt-6 space-y-0"
      >
        {/* Profile Header */}
        <ProfileHeader 
          profile={profile}
          telegramUser={telegramUser}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        {/* Balance Cards */}
        <BalanceCards balance={balance} />

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
