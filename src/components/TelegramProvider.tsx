import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useTelegram, TelegramUser } from '@/hooks/useTelegram';
import { useTelegramAuth, AuthProfile, AuthBalance, AuthReferralStats } from '@/hooks/useTelegramAuth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthModal from './AuthModal';

interface TelegramContextType {
  user: TelegramUser | null;
  theme: 'light' | 'dark';
  isReady: boolean;
  isTelegram: boolean;
  // Auth state
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  authProfile: AuthProfile | null;
  authBalance: AuthBalance | null;
  authReferralStats: AuthReferralStats | null;
  authRole: string;
  refetchAuth: () => void;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  theme: 'light',
  isReady: false,
  isTelegram: false,
  isAuthenticated: false,
  isAuthLoading: true,
  authError: null,
  authProfile: null,
  authBalance: null,
  authReferralStats: null,
  authRole: 'user',
  refetchAuth: () => {},
});

export const useTelegramContext = () => useContext(TelegramContext);

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider = ({ children }: TelegramProviderProps) => {
  const telegram = useTelegram();
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    error: authError,
    profile: authProfile,
    balance: authBalance,
    referralStats: authReferralStats,
    role: authRole,
    refetch: refetchAuth,
  } = useTelegramAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);

  // Показываем модальное окно аутентификации, если:
  // 1. Пользователь не в Telegram Web App
  // 2. Пользователь не аутентифицирован
  // 3. Приложение полностью загружено
  useEffect(() => {
    if (!telegram.isTelegram && !isAuthenticated && !isAuthLoading) {
      setShowAuthModal(true);
    }
  }, [telegram.isTelegram, isAuthenticated, isAuthLoading]);

  const contextValue: TelegramContextType = {
    ...telegram,
    isAuthenticated,
    isAuthLoading,
    authError,
    authProfile,
    authBalance,
    authReferralStats,
    authRole,
    refetchAuth,
  };

  // Don't show loading screen here since SplashScreen handles it
  // Show error screen if auth failed
  if (telegram.isTelegram && authError && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold mb-2">Ошибка авторизации</h2>
          <p className="text-muted-foreground text-sm mb-4">{authError}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={refetchAuth}
            className="px-6 py-2 gold-gradient rounded-xl text-primary-foreground font-medium"
          >
            Попробовать снова
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
      {!telegram.isTelegram && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </TelegramContext.Provider>
  );
};