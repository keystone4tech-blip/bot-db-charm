// Mock реализация Telegram WebApp SDK для разработки вне Telegram
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export interface TelegramInitDataUnsafe {
  user?: TelegramUser;
  chat?: any;
  start_param?: string;
  auth_date: number;
  hash: string;
}

export interface MockWebApp {
  initData: string;
  initDataUnsafe: TelegramInitDataUnsafe;
  colorScheme: string;
  version: string;
  platform: string;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showPopup: (params: { title?: string, message: string, buttons?: Array<{ id?: string, type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive', text?: string }> }, callback?: (buttonId: string) => void) => void;
  shareToStory: (media_url: string, params?: { widget_link?: { url: string, name?: string } }) => void;
}

// Создаем mock-объект Telegram WebApp
export const createMockWebApp = (): MockWebApp => {
  const mockUser: TelegramUser = {
    id: 123456789, // Замените на нужный ID для тестирования
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser',
    language_code: 'en',
    is_premium: false
  };

  return {
    initData: 'query_id=AAHd8SAZAAAAANBhoz2e3cFA&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22User%22%2C%22username%22%3A%22testuser%22%2C%22language_code%22%3A%22en%22%2C%22is_premium%22%3Atrue%7D&auth_date=1684360491&hash=c33f534b0a54d28a2b9a6a06b5e26c82d6705542415e4e88458a687906940123',
    initDataUnsafe: {
      user: mockUser,
      auth_date: Date.now(),
      hash: 'mock_hash'
    },
    colorScheme: 'light',
    version: '6.7',
    platform: 'web',
    headerColor: '#ffffff',
    backgroundColor: '#ffffff',
    BackButton: {
      isVisible: false,
      show: () => {},
      hide: () => {},
      onClick: () => {},
      offClick: () => {}
    },
    MainButton: {
      text: 'MAIN BUTTON',
      color: '#007AFF',
      textColor: '#FFFFFF',
      isVisible: false,
      isActive: true,
      isProgressVisible: false,
      setText: () => {},
      onClick: () => {},
      offClick: () => {},
      show: () => {},
      hide: () => {},
      enable: () => {},
      disable: () => {},
      showProgress: () => {},
      hideProgress: () => {}
    },
    HapticFeedback: {
      impactOccurred: () => {},
      notificationOccurred: () => {},
      selectionChanged: () => {}
    },
    ready: () => {
      console.log('Mock WebApp ready called');
    },
    expand: () => {
      console.log('Mock WebApp expand called');
    },
    close: () => {
      console.log('Mock WebApp close called');
    },
    showConfirm: (message, callback) => {
      const result = window.confirm(message);
      callback?.(result);
    },
    showAlert: (message, callback) => {
      alert(message);
      callback?.();
    },
    showPopup: (params, callback) => {
      const result = window.confirm(params.message);
      if (result && params.buttons) {
        const button = params.buttons.find(btn => btn.type === 'ok' || btn.type === 'default');
        callback?.(button?.id || '');
      } else {
        const cancelButton = params.buttons?.find(btn => btn.type === 'cancel');
        callback?.(cancelButton?.id || '');
      }
    },
    shareToStory: (media_url, params) => {
      console.log('Mock WebApp shareToStory called', media_url, params);
    }
  };
};

// Mock-объект
export const mockWebApp = createMockWebApp();

// Функции для проверки и получения данных
export const isTelegramWebApp = (): boolean => {
  // В режиме разработки возвращаем true, чтобы тестировать функциональность
  // В продакшене это будет определяться настоящим SDK
  return process.env.NODE_ENV === 'development' ? true : false;
};

export const getTelegramUser = () => {
  if (isTelegramWebApp()) {
    return mockWebApp.initDataUnsafe?.user;
  }
  return null;
};

export const getTelegramTheme = () => {
  if (isTelegramWebApp()) {
    return mockWebApp.colorScheme;
  }
  return 'light';
};

export const closeTelegramApp = () => {
  console.log('Mock closeTelegramApp called');
};

export const expandTelegramApp = () => {
  console.log('Mock expandTelegramApp called');
};

export const showTelegramMainButton = (text: string, onClick: () => void) => {
  console.log('Mock showTelegramMainButton called', text);
};

export const hideTelegramMainButton = () => {
  console.log('Mock hideTelegramMainButton called');
};

export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
  console.log('Mock hapticFeedback called', type);
};

export const showTelegramAlert = (message: string) => {
  alert(message);
};

export const showTelegramConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const result = confirm(message);
    resolve(result);
  });
};

// Функция для получения параметра из URL
export const getUrlParameter = (name: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

// Функция для получения реферального кода из всех возможных источников
export const getReferralCode = (): string | null => {
  // Проверяем URL-параметр startapp (для WebApp, открытого через inline-кнопку)
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

export default mockWebApp;