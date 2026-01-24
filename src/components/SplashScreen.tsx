import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Загрузка...');
  
  const { isAuthenticated, isLoading: isAuthLoading, error: authError, profile: authProfile } = useTelegramAuth();

  const messages = [
    'Подготовка к запуску...',
    'Загрузка компонентов...',
    'Инициализация системы...',
    'Почти готово...'
  ];

  useEffect(() => {
    // Прогресс загрузки
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, prev + 2);
      });
    }, 50);

    // Смена сообщений
    const messageInterval = setInterval(() => {
      const currentIndex = Math.floor((progress / 100) * messages.length);
      setCurrentMessage(messages[currentIndex] || messages[messages.length - 1]);
    }, 200);

    // Завершение через 4 секунды максимум
    const maxTimer = setTimeout(() => {
      setProgress(100);
    }, 4000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(maxTimer);
    };
  }, []);

  useEffect(() => {
    // Завершаем загрузку когда аутентификация завершена И прогресс достиг 80%
    if ((progress >= 80 || progress === 100) && !isAuthLoading && (authError || (isAuthenticated && authProfile))) {
      const timer = setTimeout(() => {
        onFinish();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [progress, isAuthLoading, isAuthenticated, authError, authProfile, onFinish]);

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
            scale: [1, 1.1, 1] 
          }}
          transition={{ 
            rotate: { duration: 2, ease: "easeInOut" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <span className="text-4xl">🚀</span>
        </motion.div>

        {/* Заголовок */}
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          TG Автоматизация
        </h1>
        <p className="text-muted-foreground mb-8">
          Умное продвижение вашего Telegram канала
        </p>

        {/* Прогресс бар */}
        <div className="w-full bg-secondary/30 rounded-full h-2 mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Процент */}
        <p className="text-sm text-muted-foreground mb-4">
          {Math.round(progress)}%
        </p>

        {/* Сообщение */}
        <motion.p
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground"
        >
          {currentMessage}
        </motion.p>

        {/* Ошибка аутентификации */}
        {authError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <p className="text-sm text-destructive mb-3">
              Ошибка аутентификации: {authError}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Перезагрузить
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SplashScreen;