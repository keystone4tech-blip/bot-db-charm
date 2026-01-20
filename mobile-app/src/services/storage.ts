import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_ID: '@user_id',
  TELEGRAM_ID: '@telegram_id',
  FIRST_NAME: '@first_name',
  REFERRAL_CODE: '@referral_code',
  ONBOARDING_COMPLETED: '@onboarding_completed',
  NOTIFICATIONS_ENABLED: '@notifications_enabled',
};

export const storage = {
  // Auth token
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // User data
  async setUserId(userId: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  },

  async getUserId(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
  },

  async setTelegramId(telegramId: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TELEGRAM_ID, telegramId);
  },

  async getTelegramId(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.TELEGRAM_ID);
  },

  async setFirstName(firstName: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_NAME, firstName);
  },

  async getFirstName(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.FIRST_NAME);
  },

  async setReferralCode(code: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.REFERRAL_CODE, code);
  },

  async getReferralCode(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFERRAL_CODE);
  },

  // Settings
  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, String(completed));
  },

  async isOnboardingCompleted(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return value === 'true';
  },

  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, String(enabled));
  },

  async areNotificationsEnabled(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    return value !== 'false'; // Default to true
  },

  // Generic methods
  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};

export default storage;
