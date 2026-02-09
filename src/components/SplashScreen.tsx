import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { isTelegramWebApp } from '@/lib/telegram';

interface SplashScreenProps {
  onFinish: () => void;
}

const CyberGrid = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Perspective grid */}
    <div className="absolute bottom-0 left-0 right-0 h-[60%]" style={{ perspective: '500px' }}>
      <motion.div
        className="w-full h-full origin-bottom"
        style={{
          transform: 'rotateX(60deg)',
          backgroundImage: `
            linear-gradient(hsl(183 100% 50% / 0.15) 1px, transparent 1px),
            linear-gradient(90deg, hsl(183 100% 50% / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 40px',
        }}
        animate={{ backgroundPositionY: ['0px', '40px'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </div>
    {/* Ambient glow */}
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,hsl(183_100%_50%/0.08)_0%,transparent_70%)]" />
    <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,hsl(307_100%_50%/0.05)_0%,transparent_70%)]" />
  </div>
);

const HexShape = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0, rotate: 0 }}
    animate={{
      opacity: [0, 0.6, 0.3],
      scale: [0.5, 1, 0.8],
      rotate: [0, 90, 180],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  >
    <div
      className="border border-primary/30"
      style={{
        width: size,
        height: size,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      }}
    />
  </motion.div>
);

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('Инициализация...');
  const finishCalledRef = useRef(false);

  const { isAuthenticated, isLoading: isAuthLoading, error: authError } = useTelegramAuth();

  const messages = [
    'Подключение к серверу...',
    'Загрузка модулей...',
    'Синхронизация данных...',
    'Система готова...',
  ];

  const finishSplash = useCallback(() => {
    if (!finishCalledRef.current) {
      finishCalledRef.current = true;
      onFinish();
    }
  }, [onFinish]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, prev + 3);
      });
    }, 40);

    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => {
        const currentIndex = messages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 700);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  useEffect(() => {
    const maxTimer = setTimeout(() => {
      finishSplash();
    }, 3000);
    return () => clearTimeout(maxTimer);
  }, [finishSplash]);

  useEffect(() => {
    const isTg = isTelegramWebApp();
    if (!isTg && !isAuthLoading && progress >= 50) {
      const timer = setTimeout(finishSplash, 300);
      return () => clearTimeout(timer);
    }
    if (isTg && !isAuthLoading && (authError || isAuthenticated) && progress >= 60) {
      const timer = setTimeout(finishSplash, 300);
      return () => clearTimeout(timer);
    }
    if (progress >= 100) {
      const timer = setTimeout(finishSplash, 200);
      return () => clearTimeout(timer);
    }
  }, [progress, isAuthLoading, isAuthenticated, authError, finishSplash]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <CyberGrid />

      {/* Floating hex shapes */}
      <HexShape delay={0} x="10%" y="20%" size={40} />
      <HexShape delay={0.5} x="80%" y="15%" size={30} />
      <HexShape delay={1} x="70%" y="70%" size={50} />
      <HexShape delay={1.5} x="15%" y="75%" size={35} />

      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none scanline opacity-30" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm w-full relative z-10"
      >
        {/* Logo */}
        <motion.div
          className="w-28 h-28 mx-auto mb-8 relative"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-primary/40" />
          <div className="absolute inset-2 rounded-full border border-accent/30" />
          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm"
            animate={{ boxShadow: ['0 0 20px hsl(183 100% 50% / 0.2)', '0 0 40px hsl(183 100% 50% / 0.4)', '0 0 20px hsl(183 100% 50% / 0.2)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.span
              className="text-3xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ⚡
            </motion.span>
          </motion.div>
          {/* Orbiting dot */}
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-primary"
            style={{ top: '50%', left: '50%' }}
            animate={{
              x: [0, 52, 0, -52, 0],
              y: [-52, 0, 52, 0, -52],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl font-bold mb-2 tracking-wider"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="gold-gradient-text">KEYSTONE</span>
          <span className="text-foreground"> TECH</span>
        </motion.h1>
        <motion.p
          className="text-muted-foreground mb-8 text-sm tracking-widest uppercase"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Telegram Automation Platform
        </motion.p>

        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary/50 rounded-full mb-3 overflow-hidden relative">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, hsl(183 100% 50%), hsl(307 100% 50%), hsl(183 100% 50%))',
              backgroundSize: '200% 100%',
            }}
            initial={{ width: 0 }}
            animate={{
              width: `${progress}%`,
              backgroundPosition: ['0% 0%', '100% 0%'],
            }}
            transition={{
              width: { duration: 0.2 },
              backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
            }}
          />
          {/* Glow on progress tip */}
          <motion.div
            className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent to-primary/50 blur-sm"
            style={{ left: `${Math.max(0, progress - 5)}%` }}
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 0.7, x: 0 }}
            className="text-xs text-muted-foreground font-mono"
          >
            {currentMessage}
          </motion.p>
          <p className="text-xs text-primary font-mono">{Math.round(progress)}%</p>
        </div>

        {authError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-secondary/50 border border-border rounded-lg"
          >
            <p className="text-sm text-muted-foreground mb-3">Продолжаем в гостевом режиме</p>
            <Button variant="outline" size="sm" onClick={finishSplash}>
              Продолжить
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SplashScreen;
