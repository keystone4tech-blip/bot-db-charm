import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useTelegram, TelegramUser } from '@/hooks/useTelegram';
import { useTelegramAuth, AuthProfile, AuthBalance, AuthReferralStats } from '@/hooks/useTelegramAuth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

  // Show loading screen while authenticating in Telegram
  if (telegram.isTelegram && isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -left-40 w-80 h-80 bg-primary/10 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center z-10"
        >
          {/* Logo with enhanced animation */}
          <motion.div
            className="mx-auto mb-6 relative"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-border flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center"
              >
                <Loader2 className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary/30 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 40 - 20],
                  y: [0, Math.random() * 40 - 20],
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
          
          <motion.h1
            className="text-2xl font-bold gold-gradient-text mb-2"
            animate={{
              textShadow: [
                '0 0 10px hsl(45 93% 47% / 0.3)',
                '0 0 20px hsl(45 93% 47% / 0.5)',
                '0 0 10px hsl(45 93% 47% / 0.3)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Keystone Tech
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-base"
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Загрузка приложения...
          </motion.p>
          
          {/* Progress bar */}
          <motion.div
            className="mt-6 w-48 h-1 bg-secondary/20 rounded-full mx-auto overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
              animate={{
                scaleX: [0, 1, 0],
                backgroundPosition: ['0%', '100%', '0%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ 
                transformOrigin: 'left',
                backgroundImage: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
                backgroundSize: '200% 100%'
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

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
    </TelegramContext.Provider>
  );
};