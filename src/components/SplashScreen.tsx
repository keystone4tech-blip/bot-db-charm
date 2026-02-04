import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { isTelegramWebApp } from '@/lib/telegram';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Загрузка...');
  const finishCalledRef = useRef(false);
  
  const { isAuthenticated, isLoading: isAuthLoading, error: authError, profile: authProfile } = useTelegramAuth();

  const messages = [
    'Подготовка к запуску...',
    'Загрузка компонентов...',
    'Инициализация системы...',
    'Почти готово...'
  ];

  const finishSplash = useCallback(() => {
    if (!finishCalledRef.current) {
      finishCalledRef.current = true;
      onFinish();
    }
  }, [onFinish]);

  useEffect(() => {
    // Прогресс загрузки - быстрее
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, prev + 4); // Быстрее загрузка
      });
    }, 40);

    // Смена сообщений
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => {
        const currentIndex = messages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 600);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  // Жёсткий таймаут - всегда завершаем через 3 секунды
  useEffect(() => {
    const maxTimer = setTimeout(() => {
      console.log('SplashScreen: Force finishing after timeout');
      finishSplash();
    }, 3000);

    return () => clearTimeout(maxTimer);
  }, [finishSplash]);

  // Проверяем условия для завершения
  useEffect(() => {
    const isTelegram = isTelegramWebApp();
    
    // Для браузера - сразу завершаем если загрузка завершена
    if (!isTelegram && !isAuthLoading && progress >= 50) {
      console.log('SplashScreen: Browser mode, finishing early');
      const timer = setTimeout(finishSplash, 300);
      return () => clearTimeout(timer);
    }
    
    // Для Telegram - завершаем когда аутентификация готова ИЛИ есть ошибка
    if (isTelegram && !isAuthLoading && (authError || isAuthenticated) && progress >= 60) {
      console.log('SplashScreen: Telegram mode, auth complete');
      const timer = setTimeout(finishSplash, 300);
      return () => clearTimeout(timer);
    }
    
    // Если прогресс достиг 100% - всегда завершаем
    if (progress >= 100) {
      console.log('SplashScreen: Progress complete, finishing');
      const timer = setTimeout(finishSplash, 200);
      return () => clearTimeout(timer);
    }
  }, [progress, isAuthLoading, isAuthenticated, authError, finishSplash]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm w-full"
      >
        {/* Логотип/Иконка */}
        <motion.div
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
          animate={{ 
            rotate: progress === 100 ? 360 : 0,
            scale: [1, 1.05, 1] 
          }}
          transition={{ 
            rotate: { duration: 1, ease: "easeInOut" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <span className="text-4xl">🚀</span>
        </motion.div>

        {/* Заголовок */}
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Keystone Tech
        </h1>
        <p className="text-muted-foreground mb-8">
          VPN & Telegram Bot Management
        </p>

        {/* Прогресс бар */}
        <div className="w-full bg-secondary/30 rounded-full h-2 mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Процент */}
        <p className="text-sm text-muted-foreground mb-4">
          {Math.round(progress)}%
        </p>

        {/* Сообщение */}
        <motion.p
          key={currentMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-sm text-muted-foreground"
        >
          {currentMessage}
        </motion.p>

        {/* Ошибка аутентификации - показываем но не блокируем */}
        {authError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-muted/50 border border-border rounded-lg"
          >
            <p className="text-sm text-muted-foreground mb-3">
              Продолжаем в гостевом режиме
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={finishSplash}
            >
              Продолжить
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SplashScreen;