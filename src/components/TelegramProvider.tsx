import { createContext, useContext, ReactNode } from 'react';
import { useTelegram, TelegramUser } from '@/hooks/useTelegram';

interface TelegramContextType {
  user: TelegramUser | null;
  theme: 'light' | 'dark';
  isReady: boolean;
  isTelegram: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  theme: 'light',
  isReady: false,
  isTelegram: false,
});

export const useTelegramContext = () => useContext(TelegramContext);

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider = ({ children }: TelegramProviderProps) => {
  const telegram = useTelegram();

  return (
    <TelegramContext.Provider value={telegram}>
      {children}
    </TelegramContext.Provider>
  );
};
