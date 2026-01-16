// Telegram WebApp SDK integration
import WebApp from '@twa-dev/sdk';
import { mockWebApp } from './telegramMock';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

let tgInstance: any;

// Проверяем сначала наличие настоящей Telegram WebApp SDK
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  // Используем настоящий SDK
  tgInstance = window.Telegram.WebApp;
} else {
  // Используем настоящий SDK в браузере (он будет использовать mock в dev-режиме)
  tgInstance = WebApp;
}

export const tg = tgInstance;

export const isTelegramWebApp = (): boolean => {
  try {
    // Проверяем наличие initData - это надежный способ определить,
    // работает ли приложение в настоящем Telegram WebApp
    return tg.initData !== '';
  } catch {
    // В режиме разработки может не быть initData, но мы всё равно хотим,
    // чтобы приложение работало, поэтому проверим другие признаки
    if (process.env.NODE_ENV === 'development') {
      // В разработке считаем, что мы в Telegram, если у нас есть mock или SDK загружен
      return true;
    }
    return false;
  }
};

export const getTelegramUser = () => {
  if (!isTelegramWebApp()) return null;
  return tg.initDataUnsafe?.user;
};

export const getTelegramTheme = () => {
  if (!isTelegramWebApp()) return 'light';
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

// Функция для получения параметра из URL
export const getUrlParameter = (name: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

// Функция для получения реферального кода из всех возможных источников
export const getReferralCode = (): string | null => {
  // Сначала проверяем параметр из Telegram WebApp
  if (typeof window !== 'undefined' && typeof tg !== 'undefined' && tg.initDataUnsafe?.start_param) {
    return tg.initDataUnsafe.start_param;
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
export default tg;
