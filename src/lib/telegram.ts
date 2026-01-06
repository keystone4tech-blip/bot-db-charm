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
