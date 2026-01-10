import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const GlobalLoader = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Показываем индикатор, если есть активные запросы
    if (isFetching > 0 || isMutating > 0) {
      setIsVisible(true);
    } else {
      // Задержка для плавного исчезновения
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isFetching, isMutating]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-50"
      initial={{ width: 0 }}
      animate={{ width: '100%' }}
      exit={{ width: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="h-full bg-gradient-to-r from-primary to-primary/80"
        animate={{ 
          backgroundPosition: ['0%', '100%', '0%']
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundImage: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
          backgroundSize: '200% 100%'
        }}
      />
    </motion.div>
  );
};

export default GlobalLoader;