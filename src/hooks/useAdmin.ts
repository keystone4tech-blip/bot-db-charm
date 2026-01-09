import { useState, useCallback } from 'react';
import { useTelegramContext } from '@/components/TelegramProvider';

export const useAdmin = () => {
  const { authRole } = useTelegramContext();
  const [isAdminMode, setIsAdminMode] = useState(false);

  const isAdmin = authRole === 'admin';

  const toggleAdminMode = useCallback(() => {
    if (isAdmin) {
      setIsAdminMode(prev => !prev);
    }
  }, [isAdmin]);

  const exitAdminMode = useCallback(() => {
    setIsAdminMode(false);
  }, []);

  return {
    isAdmin,
    isAdminMode,
    toggleAdminMode,
    exitAdminMode
  };
};
