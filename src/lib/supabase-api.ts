/**
 * API для работы с Supabase напрямую (без локального сервера)
 */

import { supabase } from '@/integrations/supabase/client';
import { supabaseAuth } from '@/lib/supabaseAuth';

/**
 * Интерфейс для профиля пользователя
 */
export interface UserProfile {
  id: string;
  telegram_id: number;
  telegram_username: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  referred_by: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Интерфейс для баланса пользователя
 */
export interface UserBalance {
  id: string;
  user_id: string;
  internal_balance: number;
  external_balance: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: string;
}

/**
 * Интерфейс для статистики рефералов
 */
export interface ReferralStats {
  id: string;
  user_id: string;
  total_referrals: number;
  total_earnings: number;
  level_1_count: number;
  level_2_count: number;
  level_3_count: number;
  level_4_count: number;
  level_5_count: number;
  updated_at: string;
}

/**
 * Интерфейс для ответа аутентификации
 */
export interface AuthResponse {
  success: boolean;
  profile?: UserProfile;
  balance?: UserBalance;
  referralStats?: ReferralStats;
  role?: string;
  error?: string;
}

/**
 * Генерация уникального реферального кода
 */
const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

/**
 * Аутентификация через Telegram - создаёт или обновляет профиль в Supabase
 */
export const authenticateTelegram = async (
  telegramUser: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  },
  referralCode?: string | null
): Promise<AuthResponse> => {
  try {
    console.log('🔐 Supabase Telegram Auth:', { telegramUser, referralCode });

    // 1. Проверяем, существует ли профиль с таким telegram_id
    const { data: existingProfile, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding profile:', findError);
      throw new Error('Ошибка поиска профиля');
    }

    let profile: UserProfile;
    let isNewUser = false;

    if (existingProfile) {
      // Обновляем существующий профиль
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          telegram_username: telegramUser.username || null,
          first_name: telegramUser.first_name || null,
          last_name: telegramUser.last_name || null,
          avatar_url: telegramUser.photo_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw new Error('Ошибка обновления профиля');
      }

      profile = updatedProfile as UserProfile;
    } else {
      // Создаём новый профиль
      isNewUser = true;
      
      // Ищем реферера по коду
      let referredBy: string | null = null;
      if (referralCode) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referralCode)
          .maybeSingle();
        
        if (referrer) {
          referredBy = referrer.id;
        }
      }

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          telegram_id: telegramUser.id,
          telegram_username: telegramUser.username || null,
          first_name: telegramUser.first_name || null,
          last_name: telegramUser.last_name || null,
          avatar_url: telegramUser.photo_url || null,
          referral_code: generateReferralCode(),
          referred_by: referredBy,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw new Error('Ошибка создания профиля');
      }

      profile = newProfile as UserProfile;

      // Создаём баланс для нового пользователя
      await supabase.from('balances').insert({
        user_id: profile.id,
        internal_balance: 0,
        external_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
      });

      // Создаём статистику рефералов
      await supabase.from('referral_stats').insert({
        user_id: profile.id,
        total_referrals: 0,
        total_earnings: 0,
        level_1_count: 0,
        level_2_count: 0,
        level_3_count: 0,
        level_4_count: 0,
        level_5_count: 0,
      });

      // Создаём реферальную связь если есть реферер
      if (referredBy) {
        await supabase.from('referrals').insert({
          referrer_id: referredBy,
          referred_id: profile.id,
          level: 1,
          earnings: 0,
          is_active: true,
        });

        // Обновляем статистику реферера вручную
        const { data: currentStats } = await supabase
          .from('referral_stats')
          .select('total_referrals, level_1_count')
          .eq('user_id', referredBy)
          .maybeSingle();

        if (currentStats) {
          await supabase
            .from('referral_stats')
            .update({
              total_referrals: (currentStats.total_referrals || 0) + 1,
              level_1_count: (currentStats.level_1_count || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', referredBy);
        }
      }
    }

    // 2. Получаем баланс
    const { data: balance } = await supabase
      .from('balances')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    // 3. Получаем статистику рефералов
    const { data: referralStats } = await supabase
      .from('referral_stats')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    // 4. Получаем роль пользователя
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile.id)
      .maybeSingle();

    console.log('✅ Auth successful:', { profileId: profile.id, isNewUser });

    return {
      success: true,
      profile,
      balance: balance as UserBalance | undefined,
      referralStats: referralStats as ReferralStats | undefined,
      role: userRole?.role || 'user',
    };
  } catch (error) {
    console.error('❌ Supabase auth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка аутентификации',
    };
  }
};

/**
 * Аутентификация по email через Supabase Auth
 */
export const loginWithEmailSupabase = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Не удалось получить данные пользователя');
    }

    // Ищем профиль по email или user_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .or(`email.eq.${email},user_id.eq.${data.user.id}`)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile lookup error:', profileError);
    }

    // Если профиль не найден, создаём новый
    let userProfile: UserProfile;
    if (!profile) {
      // Генерируем уникальный telegram_id для email пользователей (отрицательный, чтобы не конфликтовать)
      const tempTelegramId = -Math.floor(Date.now() / 1000);
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          telegram_id: tempTelegramId,
          email: email,
          user_id: data.user.id,
          first_name: email.split('@')[0],
          referral_code: generateReferralCode(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        throw new Error('Ошибка создания профиля');
      }

      userProfile = newProfile as UserProfile;

      // Создаём баланс и статистику для нового пользователя
      await supabase.from('balances').insert({
        user_id: userProfile.id,
        internal_balance: 0,
        external_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
      });

      await supabase.from('referral_stats').insert({
        user_id: userProfile.id,
        total_referrals: 0,
        total_earnings: 0,
        level_1_count: 0,
        level_2_count: 0,
        level_3_count: 0,
        level_4_count: 0,
        level_5_count: 0,
      });
    } else {
      userProfile = profile as UserProfile;
    }

    // Получаем баланс и статистику
    const { data: balance } = await supabase
      .from('balances')
      .select('*')
      .eq('user_id', userProfile.id)
      .maybeSingle();

    const { data: referralStats } = await supabase
      .from('referral_stats')
      .select('*')
      .eq('user_id', userProfile.id)
      .maybeSingle();

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userProfile.id)
      .maybeSingle();

    return {
      success: true,
      profile: userProfile,
      balance: balance as UserBalance | undefined,
      referralStats: referralStats as ReferralStats | undefined,
      role: userRole?.role || 'user',
    };
  } catch (error) {
    console.error('Email login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка входа',
    };
  }
};

/**
 * Получение профиля пользователя
 */
export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as UserProfile | null;
};

/**
 * Обновление профиля пользователя
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data as UserProfile;
};

/**
 * Получение баланса пользователя
 */
export const getBalance = async (userId: string): Promise<UserBalance | null> => {
  const { data, error } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching balance:', error);
    return null;
  }

  return data as UserBalance | null;
};

/**
 * Получение статистики рефералов
 */
export const getReferralStats = async (userId: string): Promise<ReferralStats | null> => {
  const { data, error } = await supabase
    .from('referral_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching referral stats:', error);
    return null;
  }

  return data as ReferralStats | null;
};

/**
 * Получение рефералов пользователя
 */
export const getReferrals = async (userId: string) => {
  const { data, error } = await supabase
    .from('referrals')
    .select(`
      *,
      referred:profiles!referrals_referred_id_fkey(
        id,
        telegram_username,
        first_name,
        last_name,
        avatar_url,
        created_at
      )
    `)
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }

  return data || [];
};

/**
 * Получение VPN ключей пользователя
 */
export const getVPNKeys = async (userId: string) => {
  const { data, error } = await supabase
    .from('vpn_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching VPN keys:', error);
    return [];
  }

  return data || [];
};

/**
 * Получение подписок пользователя
 */
export const getSubscriptions = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }

  return data || [];
};

/**
 * Получение ботов пользователя
 */
export const getUserBots = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_bots')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user bots:', error);
    return [];
  }

  return data || [];
};

/**
 * Получение каналов пользователя
 */
export const getTelegramChannels = async (userId: string) => {
  const { data, error } = await supabase
    .from('telegram_channels')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching telegram channels:', error);
    return [];
  }

  return data || [];
};

/**
 * Проверка сессии Supabase Auth
 */
export const checkAuthSession = async () => {
  const { data: { session }, error } = await supabaseAuth.auth.getSession();
  
  if (error) {
    console.error('Session check error:', error);
    return null;
  }

  return session;
};

/**
 * Выход из системы
 */
export const signOut = async () => {
  const { error } = await supabaseAuth.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
  }
};
