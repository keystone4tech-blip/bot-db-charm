export const formatCurrency = (amount: number, currency: string = '₽'): string => {
  return `${amount.toLocaleString('ru-RU')} ${currency}`;
};

export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'long') {
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return d.toLocaleDateString('ru-RU');
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const intervals = {
    год: 31536000,
    месяц: 2592000,
    неделю: 604800,
    день: 86400,
    час: 3600,
    минуту: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      // Handle Russian plural forms
      const lastDigit = interval % 10;
      const lastTwoDigits = interval % 100;

      let suffix = '';
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        suffix = 'ов';
      } else if (lastDigit === 1) {
        suffix = '';
      } else if (lastDigit >= 2 && lastDigit <= 4) {
        suffix = 'а';
      } else {
        suffix = 'ов';
      }

      return `${interval} ${unit}${suffix} назад`;
    }
  }

  return 'только что';
};

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
