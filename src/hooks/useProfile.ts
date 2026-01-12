import { useState, useEffect } from 'react';
import {
  UserProfile,
  UserBalance,
  ReferralStats,
  VPNKey,
  TelegramChannel,
  UserBot,
  Subscription,
  getUserVPNKeys,
  getUserChannels,
  getUserBots,
  getUserSubscriptions,
  updateUserProfile as apiUpdateUserProfile,
  createVPNKey
} from '@/lib/api';
import { useTelegramContext } from '@/components/TelegramProvider';

// Расширяем интерфейс профиля дополнительными полями
export interface ExtendedUserProfile extends UserProfile {
  city?: string;
  phone?: string;
  email?: string;
  bio?: string;
  link?: string;
}

interface ProfileHookReturn {
  profile: ExtendedUserProfile | null;
  balance: UserBalance | null;
  referralStats: ReferralStats | null;
  vpnKey: VPNKey | null;
  channel: TelegramChannel | null;
  userBot: UserBot | null;
  subscription: Subscription | null;
  referralLink: string | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<ExtendedUserProfile>) => Promise<void>;
}

export const useProfile = (): ProfileHookReturn => {
  const { authProfile, authBalance, authReferralStats, isAuthenticated, user: telegramUser } = useTelegramContext();
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [vpnKey, setVpnKey] = useState<VPNKey | null>(null);
  const [channel, setChannel] = useState<TelegramChannel | null>(null);
  const [userBot, setUserBot] = useState<UserBot | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем данные при изменении аутентификации
  useEffect(() => {
    if (isAuthenticated && authProfile) {
      // Проверяем, изменились ли данные Telegram и обновляем их в базе
      const hasChanged =
        authProfile.first_name !== telegramUser?.first_name ||
        authProfile.last_name !== telegramUser?.last_name ||
        authProfile.telegram_username !== telegramUser?.username ||
        authProfile.avatar_url !== telegramUser?.photo_url;

      // Загружаем расширенные данные профиля из базы данных (в реальной реализации)
      // Для демонстрации используем заглушку
      const extendedData = {
        city: '', // В реальной реализации загружать из базы данных
        phone: '', // В реальной реализации загружать из базы данных
        email: '', // В реальной реализации загружать из базы данных
        bio: '', // В реальной реализации загружать из базы данных
        link: '', // В реальной реализации загружать из базы данных
      };

      if (hasChanged) {
        // Обновляем профиль с новыми данными из Telegram
        const updatedProfile: ExtendedUserProfile = {
          ...authProfile,
          first_name: telegramUser?.first_name || authProfile.first_name,
          last_name: telegramUser?.last_name || authProfile.last_name,
          telegram_username: telegramUser?.username || authProfile.telegram_username,
          avatar_url: telegramUser?.photo_url || authProfile.avatar_url,
          referred_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...extendedData // Добавляем расширенные данные
        };

        // Здесь в реальной реализации нужно вызвать API для обновления данных в базе
        // updateProfileInDatabase(updatedProfile);
        setProfile(updatedProfile);
      } else {
        // Преобразуем AuthProfile в ExtendedUserProfile с дополнительными полями
        const fullProfile: ExtendedUserProfile = {
          ...authProfile,
          referred_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...extendedData // Добавляем расширенные данные
        };
        setProfile(fullProfile);
      }

      // Преобразуем AuthBalance в UserBalance
      if (authBalance) {
        const fullBalance: UserBalance = {
          id: authProfile.id,
          user_id: authProfile.id,
          ...authBalance,
          updated_at: new Date().toISOString(),
        };
        setBalance(fullBalance);
      }

      // Преобразуем AuthReferralStats в ReferralStats
      if (authReferralStats) {
        const fullReferralStats: ReferralStats = {
          id: authProfile.id,
          user_id: authProfile.id,
          ...authReferralStats,
          updated_at: new Date().toISOString(),
        };
        setReferralStats(fullReferralStats);
      }

      // Генерируем реферальную ссылку
      if (authProfile.referral_code) {
        setReferralLink(`https://t.me/Keystone_Tech_bot?start=${authProfile.referral_code}`);
      }

      // Загружаем дополнительные данные
      loadAdditionalData(authProfile.id);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, authProfile, authBalance, authReferralStats, telegramUser]);

  const loadAdditionalData = async (userId: string) => {
    try {
      setIsLoading(true);

      // Загружаем все данные параллельно
      const [vpnResponse, channelResponse, botResponse, subscriptionResponse] = await Promise.allSettled([
        getUserVPNKeys(userId),
        getUserChannels(userId),
        getUserBots(userId),
        getUserSubscriptions(userId)
      ]);

      if (vpnResponse.status === 'fulfilled' && vpnResponse.value?.length > 0) {
        setVpnKey(vpnResponse.value[0]);
        console.log('Найден существующий VPN ключ:', vpnResponse.value[0]);
      } else if (vpnResponse.status === 'fulfilled' && vpnResponse.value?.length === 0) {
        // Если у пользователя нет VPN ключа, создаем пробный на 7 дней
        // Пока отключено, чтобы избежать ошибок при загрузке
        console.log('У пользователя нет VPN ключа, пробный ключ будет создан позже...');
        // Отложенная генерация пробного ключа (временно отключена)
        // setTimeout(() => createTrialVPNKey(userId), 1000);
      } else if (vpnResponse.status === 'rejected') {
        console.error('Ошибка при получении VPN ключей:', vpnResponse.reason);
      }

      if (channelResponse.status === 'fulfilled' && channelResponse.value?.length > 0) {
        setChannel(channelResponse.value[0]);
      }

      if (botResponse.status === 'fulfilled' && botResponse.value?.length > 0) {
        setUserBot(botResponse.value[0]);
      }

      if (subscriptionResponse.status === 'fulfilled' && subscriptionResponse.value?.length > 0) {
        setSubscription(subscriptionResponse.value[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const createTrialVPNKey = async (userId: string) => {
    try {
      console.log('Попытка создания пробного VPN ключа для пользователя:', userId);

      // Создаем пробный VPN ключ на 7 дней
      const trialKey = {
        user_id: userId,
        key_value: `trial-${userId.substring(0, 8)}-${Date.now()}`,
        server_location: 'США - Нью-Йорк', // или другое значение по умолчанию
        status: 'active',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 дней
        is_trial: true
      };

      console.log('Данные для создания VPN ключа:', trialKey);

      // Сохраняем пробный ключ в базе данных
      const response = await createVPNKey(trialKey);
      console.log('Ответ от API при создании VPN ключа:', response);

      if (response) {
        setVpnKey(response);
        console.log('VPN ключ успешно установлен в состояние');
      } else {
        console.warn('Ответ от API пустой при создании VPN ключа');
      }
    } catch (err) {
      console.error('Ошибка создания пробного VPN ключа:', err);
      setError(err instanceof Error ? err.message : 'Ошибка создания пробного VPN ключа');
    }
  };

  const updateProfile = async (updates: Partial<ExtendedUserProfile>) => {
    try {
      // В реальной реализации здесь будет вызов API для обновления профиля
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      // Если профиль существует, обновляем его в базе данных
      if (profile) {
        try {
          await apiUpdateUserProfile(profile.id, updates);
        } catch (apiError) {
          console.error('Ошибка обновления профиля в базе данных:', apiError);
          // Возвращаем предыдущее состояние в случае ошибки
          setProfile(prev => prev ? {
            ...prev,
            ...updates
          } : null);
          throw apiError;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления профиля');
      throw err;
    }
  };

  return {
    profile,
    balance,
    referralStats,
    vpnKey,
    channel,
    userBot,
    subscription,
    referralLink,
    isLoading,
    error,
    updateProfile
  };
};