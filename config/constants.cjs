module.exports = {
  AUTH_DATA_MAX_AGE: 86400,
  DEFAULT_USER_ROLE: 'user',
  ADMIN_ID: process.env.ADMIN_ID || process.env.ADMIN_IDS || null,
  DEFAULT_BALANCE: {
    internal_balance: 0,
    external_balance: 0,
    total_earned: 0,
    total_withdrawn: 0,
  },
  DEFAULT_REFERRAL_STATS: {
    total_referrals: 0,
    total_earnings: 0,
  },
  SUPPORT_TICKET_STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    CLOSED: 'closed',
  },
  SUBSCRIPTION_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    EXPIRED: 'expired',
  },
};
