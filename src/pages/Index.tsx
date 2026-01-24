import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useTelegram } from '@/hooks/useTelegram';
import { AppHeader } from '@/components/ui/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { InfoView } from '@/components/views/InfoView';
import { ChannelsView } from '@/components/views/ChannelsView';
import { SubscriptionView } from '@/components/views/SubscriptionView';
import { PromotionView } from '@/components/views/PromotionView';
import { VPNView } from '@/components/views/VPNView';
import { ProfileView } from '@/components/views/ProfileView';
import { ReferralProgramView } from '@/components/views/ReferralProgramView';
import { BotsView } from '@/components/views/BotsView';
import { AdminStatsView } from '@/components/admin/AdminStatsView';
import { AdminUsersView } from '@/components/admin/AdminUsersView';
import { AdminBotsView } from '@/components/admin/AdminBotsView';
import { AdminSettingsView } from '@/components/admin/AdminSettingsView';
import AdminTicketsView from '@/components/admin/AdminTicketsView';

const viewVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const Index = () => {
  const { isAuthenticated, isLoading } = useTelegramAuth();
  const { isTelegram } = useTelegram();
  const [activeTab, setActiveTab] = useState('info');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminTab, setAdminTab] = useState('admin-stats');

  // Прокручиваем к началу при изменении вкладки
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, isAdminMode, adminTab]);

  // Redirect to auth if not authenticated and not in Telegram
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isTelegram) {
    return <Navigate to="/auth" replace />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterAdminMode = () => {
    setIsAdminMode(true);
    setAdminTab('admin-stats');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitAdminMode = () => {
    setIsAdminMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminTabChange = (tab: string) => {
    setAdminTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderAdminView = () => {
    switch (adminTab) {
      case 'admin-stats':
        return <AdminStatsView key="admin-stats" />;
      case 'admin-users':
        return <AdminUsersView key="admin-users" />;
      case 'admin-bots':
        return <AdminBotsView key="admin-bots" />;
      case 'admin-tickets':
        return <AdminTicketsView key="admin-tickets" />;
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
      case 'vpn':
        return <VPNView key="vpn" />;
      case 'channels':
        return <ChannelsView key="channels" />;
      case 'promotion':
        return <PromotionView key="promotion" />;
      case 'bots':
        return <BotsView key="bots" />;
      case 'referral':
        return <ReferralProgramView key="referral" />;
      case 'profile':
        return <ProfileView key="profile" onNavigate={handleTabChange} onEnterAdminMode={handleEnterAdminMode} />;
      case 'subscription':
        return <SubscriptionView key="subscription" />;
      default:
        return <InfoView key="info" />;
    }
  };

  // Прокручиваем к началу при изменении вкладки
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, isAdminMode, adminTab]);

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto overflow-x-hidden pt-14">
      {/* App header */}
      <AppHeader isAdminMode={isAdminMode} />

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
          onTabChange={handleAdminTabChange}
          onExitAdmin={handleExitAdminMode}
        />
      ) : (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
};

export default Index;