// This file is updated to use direct PostgreSQL connection via custom API endpoints
// Instead of Supabase client, we'll use fetch API to interact with our backend functions

// Define the API endpoints for our backend functions
const API_BASE_URL = '/api';

// Create a custom client to interact with our backend
export const supabase = {
  // Profiles table interactions
  from: (table: string) => {
    switch(table) {
      case 'profiles':
        return {
          select: (columns?: string) => new ProfileQueryBuilder(columns),
          insert: (data: any) => new ProfileQueryBuilder().insert(data),
          update: (data: any) => new ProfileQueryBuilder().update(data),
          eq: (column: string, value: any) => new ProfileQueryBuilder().eq(column, value),
          single: () => new ProfileQueryBuilder().single(),
        };
      case 'balances':
        return {
          select: (columns?: string) => new BalanceQueryBuilder(columns),
          insert: (data: any) => new BalanceQueryBuilder().insert(data),
          update: (data: any) => new BalanceQueryBuilder().update(data),
          eq: (column: string, value: any) => new BalanceQueryBuilder().eq(column, value),
          single: () => new BalanceQueryBuilder().single(),
        };
      case 'referral_stats':
        return {
          select: (columns?: string) => new ReferralStatsQueryBuilder(columns),
          insert: (data: any) => new ReferralStatsQueryBuilder().insert(data),
          update: (data: any) => new ReferralStatsQueryBuilder().update(data),
          eq: (column: string, value: any) => new ReferralStatsQueryBuilder().eq(column, value),
          single: () => new ReferralStatsQueryBuilder().single(),
        };
      case 'referrals':
        return {
          select: (columns?: string) => new ReferralsQueryBuilder(columns),
          insert: (data: any) => new ReferralsQueryBuilder().insert(data),
          update: (data: any) => new ReferralsQueryBuilder().update(data),
          eq: (column: string, value: any) => new ReferralsQueryBuilder().eq(column, value),
          single: () => new ReferralsQueryBuilder().single(),
        };
      case 'subscriptions':
        return {
          select: (columns?: string) => new SubscriptionsQueryBuilder(columns),
          insert: (data: any) => new SubscriptionsQueryBuilder().insert(data),
          update: (data: any) => new SubscriptionsQueryBuilder().update(data),
          eq: (column: string, value: any) => new SubscriptionsQueryBuilder().eq(column, value),
          single: () => new SubscriptionsQueryBuilder().single(),
        };
      case 'vpn_keys':
        return {
          select: (columns?: string) => new VpnKeysQueryBuilder(columns),
          insert: (data: any) => new VpnKeysQueryBuilder().insert(data),
          update: (data: any) => new VpnKeysQueryBuilder().update(data),
          eq: (column: string, value: any) => new VpnKeysQueryBuilder().eq(column, value),
          single: () => new VpnKeysQueryBuilder().single(),
        };
      case 'telegram_channels':
        return {
          select: (columns?: string) => new TelegramChannelsQueryBuilder(columns),
          insert: (data: any) => new TelegramChannelsQueryBuilder().insert(data),
          update: (data: any) => new TelegramChannelsQueryBuilder().update(data),
          eq: (column: string, value: any) => new TelegramChannelsQueryBuilder().eq(column, value),
          single: () => new TelegramChannelsQueryBuilder().single(),
        };
      case 'user_bots':
        return {
          select: (columns?: string) => new UserBotsQueryBuilder(columns),
          insert: (data: any) => new UserBotsQueryBuilder().insert(data),
          update: (data: any) => new UserBotsQueryBuilder().update(data),
          eq: (column: string, value: any) => new UserBotsQueryBuilder().eq(column, value),
          single: () => new UserBotsQueryBuilder().single(),
        };
      case 'user_roles':
        return {
          select: (columns?: string) => new UserRolesQueryBuilder(columns),
          insert: (data: any) => new UserRolesQueryBuilder().insert(data),
          update: (data: any) => new UserRolesQueryBuilder().update(data),
          eq: (column: string, value: any) => new UserRolesQueryBuilder().eq(column, value),
          single: () => new UserRolesQueryBuilder().single(),
        };
      case 'support_tickets':
        return {
          select: (columns?: string) => new SupportTicketsQueryBuilder(columns),
          insert: (data: any) => new SupportTicketsQueryBuilder().insert(data),
          update: (data: any) => new SupportTicketsQueryBuilder().update(data),
          eq: (column: string, value: any) => new SupportTicketsQueryBuilder().eq(column, value),
          single: () => new SupportTicketsQueryBuilder().single(),
        };
      default:
        throw new Error(`Unknown table: ${table}`);
    }
  },

  functions: {
    invoke: async (functionName: string, options?: { body?: any }) => {
      // Handle the telegram-auth function specifically
      if (functionName === 'telegram-auth') {
        try {
          const response = await fetch('/api/telegram-auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(options?.body || {})
          });

          const data = await response.json();
          return { data, error: response.ok ? null : { message: 'Function call failed' } };
        } catch (error) {
          return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
        }
      }

      // For other functions, return a mock response
      return { data: null, error: { message: 'Function not implemented' } };
    }
  }
};

// Base query builder class
class BaseQueryBuilder {
  protected query: any = {};
  protected selectedColumns?: string;
  protected tableName: string;

  constructor(tableName: string, columns?: string) {
    this.tableName = tableName;
    this.selectedColumns = columns;
  }

  eq(column: string, value: any) {
    this.query[column] = value;
    return this;
  }

  async single() {
    try {
      const response = await fetch(`${API_BASE_URL}/${this.tableName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Query': JSON.stringify(this.query),
          'Select': this.selectedColumns || '*'
        }
      });

      const data = await response.json();
      return { data: response.ok ? data : null, error: response.ok ? null : { message: 'Query failed' } };
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  }

  async insert(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/${this.tableName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return { data: response.ok ? result : null, error: response.ok ? null : { message: 'Insert failed' } };
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  }

  async update(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/${this.tableName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, where: this.query })
      });

      const result = await response.json();
      return { data: response.ok ? result : null, error: response.ok ? null : { message: 'Update failed' } };
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
    }
  }
}

// Specific query builders for each table
class ProfileQueryBuilder extends BaseQueryBuilder {
  constructor(columns?: string) {
    super('profiles', columns);
  }
}

class BalanceQueryBuilder extends BaseQueryBuilder {
  constructor(columns?: string) {
    super('balances', columns);
  }
}

class ReferralStatsQueryBuilder extends BaseQueryBuilder {
  constructor(columns?: string) {
    super('referral_stats', columns);
  }
}

class ReferralsQueryBuilder extends BaseQueryBuilder {
  constructor(columns?: string) {
    super('referrals', columns);
  }
}

class SubscriptionsQueryBuilder extends BaseQueryBuilder {
  constructor(columns?: string) {
    super('subscriptions', columns);
  }
}

class VpnKeysQueryBuilder extends BaseQueryBuilder {
  constructor(columns?: string) {
    super('vpn_keys', columns);
  }
}

class TelegramChannelsQueryBuilder extends BaseQueryBuilder {
  constructor(columns?: string) {
    super('telegram_channels', columns);
  }
}

class UserBotsQueryBuilder extends BaseQueryBuilder {
  constructor(columns?: string) {
    super('user_bots', columns);
  }
}

class UserRolesQueryBuilder extends BaseQueryBuilder {
  constructor(columns?: string) {
    super('user_roles', columns);
  }
}

class SupportTicketsQueryBuilder extends BaseQueryBuilder {
  constructor(columns?: string) {
    super('support_tickets', columns);
  }
};