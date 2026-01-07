// Telegram WebApp SDK integration
import WebApp from '@twa-dev/sdk';

export const tg = WebApp;

export const isTelegramWebApp = (): boolean => {
  try {
    return WebApp.initData !== '';
  } catch {
    return false;
  }
};

export const getTelegramUser = () => {
  if (!isTelegramWebApp()) return null;
  return WebApp.initDataUnsafe?.user;
};

export const getTelegramTheme = () => {
  if (!isTelegramWebApp()) return 'light';
  return WebApp.colorScheme;
};

export const closeTelegramApp = () => {
  if (isTelegramWebApp()) {
    WebApp.close();
  }
};

export const expandTelegramApp = () => {
  if (isTelegramWebApp()) {
    WebApp.expand();
  }
};

export const showTelegramMainButton = (text: string, onClick: () => void) => {
  if (isTelegramWebApp()) {
    WebApp.MainButton.text = text;
    WebApp.MainButton.onClick(onClick);
    WebApp.MainButton.show();
  }
};

export const hideTelegramMainButton = () => {
  if (isTelegramWebApp()) {
    WebApp.MainButton.hide();
  }
};

export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
  if (isTelegramWebApp()) {
    WebApp.HapticFeedback.impactOccurred(type);
  }
};

export const showTelegramAlert = (message: string) => {
  if (isTelegramWebApp()) {
    WebApp.showAlert(message);
  } else {
    alert(message);
  }
};

export const showTelegramConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isTelegramWebApp()) {
      WebApp.showConfirm(message, resolve);
    } else {
      resolve(confirm(message));
    }
  });
};

// Функция для получения параметра из URL
export const getUrlParameter = (name: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

// Функция для получения реферального кода из всех возможных источников
export const getReferralCode = (): string | null => {
  // Сначала проверяем параметр из Telegram WebApp
  if (typeof window !== 'undefined' && typeof WebApp !== 'undefined' && WebApp.initDataUnsafe?.start_param) {
    return WebApp.initDataUnsafe.start_param;
  }
  
  // Затем проверяем URL-параметр startapp (для WebApp, открытого через inline-кнопку)
  const urlStartParam = getUrlParameter('startapp');
  if (urlStartParam && urlStartParam !== 'main') {
    return urlStartParam;
  }
  
  // Также проверяем общий параметр referral или ref
  const urlRefParam = getUrlParameter('referral') || getUrlParameter('ref');
  if (urlRefParam) {
    return urlRefParam;
  }
  
  return null;
};

// Export the library
export default WebApp;
