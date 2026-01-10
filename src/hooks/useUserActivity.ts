import { useEffect, useState } from 'react';

/**
 * Хук для отслеживания активности пользователя
 * Возвращает true, если пользователь активен (не на вкладке "не в фокусе", не в спящем режиме и т.д.)
 */
export const useUserActivity = () => {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
    };

    const handleFocus = () => {
      setIsActive(true);
    };

    const handleBlur = () => {
      setIsActive(false);
    };

    // События для отслеживания активности пользователя
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Изначальное состояние
    setIsActive(!document.hidden);

    // Очистка событий
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isActive;
};