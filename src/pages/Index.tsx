import { useState, useEffect, Suspense } from 'react';
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
import ErrorBoundary from '@/components/ErrorBoundary';

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

  // Remove duplicate useEffect - move all useEffect calls to the top
  // No conditional hooks after this point
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
        return (
          <ErrorBoundary>
            <AdminStatsView key="admin-stats" />
          </ErrorBoundary>
        );
      case 'admin-users':
        return (
          <ErrorBoundary>
            <AdminUsersView key="admin-users" />
          </ErrorBoundary>
        );
      case 'admin-bots':
        return (
          <ErrorBoundary>
            <AdminBotsView key="admin-bots" />
          </ErrorBoundary>
        );
      case 'admin-tickets':
        return (
          <ErrorBoundary>
            <AdminTicketsView key="admin-tickets" />
          </ErrorBoundary>
        );
      case 'admin-settings':
        return (
          <ErrorBoundary>
            <AdminSettingsView key="admin-settings" />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <AdminStatsView key="admin-stats" />
          </ErrorBoundary>
        );
    }
  };

  const renderView = () => {
    if (isAdminMode) {
      return renderAdminView();
    }

    switch (activeTab) {
      case 'info':
        return (
          <ErrorBoundary>
            <InfoView key="info" />
          </ErrorBoundary>
        );
      case 'vpn':
        return (
          <ErrorBoundary>
            <VPNView key="vpn" />
          </ErrorBoundary>
        );
      case 'channels':
        return (
          <ErrorBoundary>
            <ChannelsView key="channels" />
          </ErrorBoundary>
        );
      case 'promotion':
        return (
          <ErrorBoundary>
            <PromotionView key="promotion" />
          </ErrorBoundary>
        );
      case 'bots':
        return (
          <ErrorBoundary>
            <BotsView key="bots" />
          </ErrorBoundary>
        );
      case 'referral':
        return (
          <ErrorBoundary>
            <ReferralProgramView key="referral" />
          </ErrorBoundary>
        );
      case 'profile':
        return (
          <ErrorBoundary>
            <ProfileView key="profile" onNavigate={handleTabChange} onEnterAdminMode={handleEnterAdminMode} />
          </ErrorBoundary>
        );
      case 'subscription':
        return (
          <ErrorBoundary>
            <SubscriptionView key="subscription" />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <InfoView key="info" />
          </ErrorBoundary>
        );
    }
  };

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