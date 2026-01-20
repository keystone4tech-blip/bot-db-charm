export interface User {
  id: string;
  telegram_id: number;
  telegram_username?: string;
  first_name: string;
  last_name?: string;
  avatar_url?: string;
  referral_code: string;
  referred_by?: string;
  created_at: string;
}

export interface VPNKey {
  id: string;
  user_id: string;
  key_name: string;
  key: string;
  is_active: boolean;
  created_at: string;
}

export interface Channel {
  id: string;
  user_id: string;
  channel_id: string;
  channel_name: string;
  channel_username?: string;
  members_count?: number;
  created_at: string;
}

export interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_earnings: number;
  recent_referrals: User[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  profile?: User;
  balance?: {
    balance: number;
    earned: number;
    withdrawn: number;
  };
  referralStats?: ReferralStats;
  role?: string;
}

export interface ReferralVerifyResponse {
  valid: boolean;
  message?: string;
  user?: {
    id: string;
    first_name: string;
    username?: string;
    referrals_count: number;
  };
}
