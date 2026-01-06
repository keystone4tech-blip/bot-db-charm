import { useEffect, useState } from 'react';
import { tg, isTelegramWebApp, getTelegramUser, getTelegramTheme, expandTelegramApp } from '@/lib/telegram';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export const useTelegram = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const init = () => {
      const isTg = isTelegramWebApp();
      setIsTelegram(isTg);
      
      if (isTg) {
        tg.ready();
        expandTelegramApp();
        
        const tgUser = getTelegramUser();
        if (tgUser) {
          setUser(tgUser as TelegramUser);
        }
        
        const tgTheme = getTelegramTheme();
        setTheme(tgTheme as 'light' | 'dark');
        
        // Apply Telegram theme
        if (tgTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      setIsReady(true);
    };

    init();
  }, []);

  return {
    user,
    theme,
    isReady,
    isTelegram,
    tg,
  };
};
