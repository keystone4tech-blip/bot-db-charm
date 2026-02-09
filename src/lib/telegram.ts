// Telegram WebApp SDK integration
import WebApp from '@twa-dev/sdk';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tgInstance: any;

// Check for real Telegram WebApp first
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  tgInstance = window.Telegram.WebApp;
} else {
  tgInstance = WebApp;
}

export const tg = tgInstance;

export const isTelegramWebApp = (): boolean => {
  try {
    // Check for real initData — only present in actual Telegram WebApp
    if (tg.initData && tg.initData !== '') {
      return true;
    }
    // Also check for Telegram-specific URL params
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      if (url.includes('tgWebAppData') || url.includes('tgWebAppVersion')) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};

export const getTelegramUser = () => {
  if (!isTelegramWebApp()) return null;
  return tg.initDataUnsafe?.user;
};

export const getTelegramTheme = () => {
  if (!isTelegramWebApp()) return 'dark';
  return tg.colorScheme;
};

export const closeTelegramApp = () => {
  if (isTelegramWebApp()) {
    tg.close();
  }
};

export const expandTelegramApp = () => {
  if (isTelegramWebApp()) {
    tg.expand();
  }
};

export const showTelegramMainButton = (text: string, onClick: () => void) => {
  if (isTelegramWebApp()) {
    tg.MainButton.text = text;
    tg.MainButton.onClick(onClick);
    tg.MainButton.show();
  }
};

export const hideTelegramMainButton = () => {
  if (isTelegramWebApp()) {
    tg.MainButton.hide();
  }
};

export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
  if (isTelegramWebApp()) {
    tg.HapticFeedback.impactOccurred(type);
  }
};

export const showTelegramAlert = (message: string) => {
  if (isTelegramWebApp()) {
    tg.showAlert(message);
  } else {
    alert(message);
  }
};

export const showTelegramConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isTelegramWebApp()) {
      tg.showConfirm(message, resolve);
    } else {
      resolve(confirm(message));
    }
  });
};

export const getUrlParameter = (name: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

export const getReferralCode = (): string | null => {
  if (typeof window !== 'undefined' && typeof tg !== 'undefined' && tg.initDataUnsafe?.start_param) {
    return tg.initDataUnsafe.start_param;
  }

  const urlStartParam = getUrlParameter('startapp');
  if (urlStartParam && urlStartParam !== 'main') {
    return urlStartParam;
  }

  const urlRefParam = getUrlParameter('referral') || getUrlParameter('ref');
  if (urlRefParam) {
    return urlRefParam;
  }

  return null;
};

export default tg;
