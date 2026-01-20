import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to every request
    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('auth_token');
        }
        throw error;
      }
    );
  }

  // Register user
  async registerUser(data: {
    telegram_id?: number;
    first_name: string;
    last_name?: string;
    username?: string;
    avatar_url?: string;
    referral_code?: string;
  }) {
    return this.client.post('/users/register', data);
  }

  // Get user by Telegram ID
  async getUserByTelegramId(telegramId: number) {
    return this.client.get(`/users/${telegramId}`);
  }

  // Verify referral code
  async verifyReferralCode(code: string, telegramId?: number) {
    return this.client.post('/referral-code/verify', {
      referral_code: code,
      telegram_id: telegramId,
    });
  }

  // Get VPN keys
  async getVPNKeys(userId: string) {
    return this.client.get(`/vpn-keys/${userId}`);
  }

  // Create VPN key
  async createVPNKey(data: {
    user_id: string;
    key_name: string;
  }) {
    return this.client.post('/vpn-keys', data);
  }

  // Get channels
  async getChannels(userId: string) {
    return this.client.get(`/telegram-channels/${userId}`);
  }

  // Create channel
  async createChannel(data: {
    user_id: string;
    channel_id: string;
    channel_name: string;
    channel_username?: string;
  }) {
    return this.client.post('/telegram-channels', data);
  }

  // Get referral stats
  async getReferralStats(userId: string) {
    return this.client.get(`/referral-stats/${userId}`);
  }

  // Set auth token
  setToken(token: string) {
    AsyncStorage.setItem('auth_token', token);
  }

  // Remove auth token
  async clearToken() {
    await AsyncStorage.removeItem('auth_token');
  }

  // Get auth token
  async getToken() {
    return await AsyncStorage.getItem('auth_token');
  }
}

export const apiClient = new APIClient();
