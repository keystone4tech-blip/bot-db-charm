import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TelegramProvider } from '@/components/TelegramProvider';
import { BottomNav } from '@/components/BottomNav';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { InfoView } from '@/components/views/InfoView';
import { SubscriptionView } from '@/components/views/SubscriptionView';
import { PromotionView } from '@/components/views/PromotionView';
import { VPNView } from '@/components/views/VPNView';
import { ProfileView } from '@/components/views/ProfileView';
import { ReferralProgramView } from '@/components/views/ReferralProgramView';
import { AdminStatsView } from '@/components/admin/AdminStatsView';
import { AdminUsersView } from '@/components/admin/AdminUsersView';
import { AdminBotsView } from '@/components/admin/AdminBotsView';
import { AdminSettingsView } from '@/components/admin/AdminSettingsView';

const viewVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminTab, setAdminTab] = useState('admin-stats');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleEnterAdminMode = () => {
    setIsAdminMode(true);
    setAdminTab('admin-stats');
  };

  const handleExitAdminMode = () => {
    setIsAdminMode(false);
  };

  const renderAdminView = () => {
    switch (adminTab) {
      case 'admin-stats':
        return <AdminStatsView key="admin-stats" />;
      case 'admin-users':
        return <AdminUsersView key="admin-users" />;
      case 'admin-bots':
        return <AdminBotsView key="admin-bots" />;
      case 'admin-settings':
        return <AdminSettingsView key="admin-settings" />;
      default:
        return <AdminStatsView key="admin-stats" />;
    }
  };

  const renderView = () => {
    if (isAdminMode) {
      return renderAdminView();
    }

    switch (activeTab) {
      case 'info':
        return <InfoView key="info" />;
      case 'subscription':
        return <SubscriptionView key="subscription" />;
      case 'promotion':
        return <PromotionView key="promotion" />;
      case 'vpn':
        return <VPNView key="vpn" />;
      case 'profile':
        return <ProfileView key="profile" onNavigate={handleTabChange} onEnterAdminMode={handleEnterAdminMode} />;
      case 'referral':
        return <ReferralProgramView key="referral" />;
      default:
        return <InfoView key="info" />;
    }
  };

  return (
    <TelegramProvider>
      <div className="min-h-screen bg-background max-w-md mx-auto overflow-x-hidden">
        {/* Logo header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border"
        >
          <div className="flex items-center justify-center h-14 px-4">
            <motion.h1
              className="text-lg font-bold gold-gradient-text"
              animate={{
                textShadow: [
                  '0 0 10px hsl(45 93% 47% / 0.3)',
                  '0 0 20px hsl(45 93% 47% / 0.5)',
                  '0 0 10px hsl(45 93% 47% / 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isAdminMode ? '⚙️ Админ-панель' : 'Keystone Tech'}
            </motion.h1>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="min-h-[calc(100vh-3.5rem-4rem)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={isAdminMode ? adminTab : activeTab}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom navigation */}
        {isAdminMode ? (
          <AdminBottomNav 
            activeTab={adminTab} 
            onTabChange={setAdminTab} 
            onExitAdmin={handleExitAdminMode} 
          />
        ) : (
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        )}
      </div>
    </TelegramProvider>
  );
};

export default Index;
