import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground text-center py-2 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
    >
      Подключение к интернету потеряно
    </motion.div>
  );
};

export default ConnectionStatus;