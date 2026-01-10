import { useIsFetching, useIsMutating } from '@tanstack/react-query';
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
    <div className="fixed top-0 left-0 right-0 h-1 bg-primary z-50">
      <div className="h-full bg-gradient-to-r from-primary to-primary/80"></div>
    </div>
  );
};

export default GlobalLoader;