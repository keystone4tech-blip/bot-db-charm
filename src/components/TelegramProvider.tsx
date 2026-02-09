import { createContext, useContext, ReactNode } from 'react';
import { useTelegram, TelegramUser } from '@/hooks/useTelegram';
import { useTelegramAuth, AuthProfile, AuthBalance, AuthReferralStats } from '@/hooks/useTelegramAuth';

interface TelegramContextType {
  user: TelegramUser | null;
  theme: 'light' | 'dark';
  isReady: boolean;
  isTelegram: boolean;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  authProfile: AuthProfile | null;
  authBalance: AuthBalance | null;
  authReferralStats: AuthReferralStats | null;
  authRole: string;
  refetchAuth: () => void;
  setAuthenticated: (data: { profile: AuthProfile; balance?: any; referralStats?: any; role?: string }) => void;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  theme: 'dark',
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
  setAuthenticated: () => {},
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
    setAuthenticated,
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
    setAuthenticated,
  };

  // Don't block the app on Telegram auth errors — let SplashScreen and routing handle it
  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};
