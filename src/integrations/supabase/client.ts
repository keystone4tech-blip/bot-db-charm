// Клиент для взаимодействия с Node.js API
// Заменяет Supabase клиент для работы с локальной PostgreSQL базой

import { getTelegramUser } from '@/lib/telegram';

interface QueryBuilder {
  eq(field: string, value: any): QueryBuilder;
  neq(field: string, value: any): QueryBuilder;
  gt(field: string, value: any): QueryBuilder;
  gte(field: string, value: any): QueryBuilder;
  lt(field: string, value: any): QueryBuilder;
  lte(field: string, value: any): QueryBuilder;
  in(field: string, values: any[]): QueryBuilder;
  like(field: string, pattern: string): QueryBuilder;
  ilike(field: string, pattern: string): QueryBuilder;
  is(field: string, value: any): QueryBuilder;
  or(filters: string, referenceTable?: string): QueryBuilder;
  not(field: string, operator: string, value: any): QueryBuilder;
  fts(field: string, query: string, options?: { config?: string; type?: 'websearch' | 'plainto_tsquery' | 'phraseto_tsquery' }): QueryBuilder;
  plfts(field: string, query: string, options?: { config?: string; type?: 'websearch' | 'plainto_tsquery' | 'phraseto_tsquery' }): QueryBuilder;
  phfts(field: string, query: string, options?: { config?: string; type?: 'websearch' | 'plainto_tsquery' | 'phraseto_tsquery' }): QueryBuilder;
  wfts(field: string, query: string, options?: { config?: string; type?: 'websearch' | 'plainto_tsquery' | 'phraseto_tsquery' }): QueryBuilder;
  textSearch(field: string, query: string, options?: { config?: string; type?: 'websearch' | 'plainto_tsquery' | 'phraseto_tsquery' }): QueryBuilder;
  match(object: Record<string, unknown>): QueryBuilder;
  contains(field: string, value: object | string[] | null): QueryBuilder;
  containedBy(field: string, value: object | string[]): QueryBuilder;
  rangeGt(field: string, range: string): QueryBuilder;
  rangeGte(field: string, range: string): QueryBuilder;
  rangeLt(field: string, range: string): QueryBuilder;
  rangeLte(field: string, range: string): QueryBuilder;
  rangeAdjacent(field: string, range: string): QueryBuilder;
  overlaps(field: string, range: string): QueryBuilder;
  strictlyLeft(field: string, range: string): QueryBuilder;
  strictlyRight(field: string, range: string): QueryBuilder;
  notExtendRight(field: string, range: string): QueryBuilder;
  notExtendLeft(field: string, range: string): QueryBuilder;
  and(filters: string): QueryBuilder;
  filter(column: string, operator: string, value: any): QueryBuilder;
  select(columns?: string): QueryBuilder;
  insert(values: Partial<any> | Partial<any>[], options?: { returning?: 'minimal' | 'representation' }): Promise<{ data: any | null; error: any | null }>;
  upsert(values: Partial<any> | Partial<any>[], options?: { onConflict?: string; ignoreDuplicates?: boolean; returning?: 'minimal' | 'representation' }): Promise<{ data: any | null; error: any | null }>;
  update(values: Partial<any>): QueryBuilder;
  delete(): QueryBuilder;
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean; referencedTable?: string }): QueryBuilder;
  limit(count: number, options?: { foreignTable?: string }): QueryBuilder;
  range(from: number, to: number, options?: { foreignTable?: string }): QueryBuilder;
  single(): Promise<{ data: any; error: any | null }>;
  maybeSingle(): Promise<{ data: any | null; error: any | null }>;
  first(): Promise<{ data: any | null; error: any | null }>;
  then(onfulfilled?: ((value: any) => any) | undefined, onrejected?: ((reason: any) => any) | undefined): Promise<any>;
}

class TableApi {
  private tableName: string;
  private baseUrl: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.baseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
  }

  select(columns?: string): QueryBuilder {
    // Временная реализация - возвращаем объект с методами
    return new QueryImpl(this.tableName, 'select', { columns });
  }

  async insert(values: Partial<any> | Partial<any>[]) {
    try {
      const response = await fetch(`${this.baseUrl}/api/${this.tableName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: values })
      });

      const result = await response.json();
      return { data: result, error: response.ok ? null : result };
    } catch (error) {
      return { data: null, error };
    }
  }

  update(values: Partial<any>) {
    return new QueryImpl(this.tableName, 'update', { values });
  }

  delete() {
    return new QueryImpl(this.tableName, 'delete', {});
  }
}

class QueryImpl implements QueryBuilder {
  private tableName: string;
  private operation: string;
  private params: any;

  constructor(tableName: string, operation: string, params: any) {
    this.tableName = tableName;
    this.operation = operation;
    this.params = params;
  }

  eq(field: string, value: any): QueryBuilder {
    this.params[field] = { eq: value };
    return this;
  }

  neq(field: string, value: any): QueryBuilder {
    this.params[field] = { neq: value };
    return this;
  }

  gt(field: string, value: any): QueryBuilder {
    this.params[field] = { gt: value };
    return this;
  }

  gte(field: string, value: any): QueryBuilder {
    this.params[field] = { gte: value };
    return this;
  }

  lt(field: string, value: any): QueryBuilder {
    this.params[field] = { lt: value };
    return this;
  }

  lte(field: string, value: any): QueryBuilder {
    this.params[field] = { lte: value };
    return this;
  }

  in(field: string, values: any[]): QueryBuilder {
    this.params[field] = { in: values };
    return this;
  }

  like(field: string, pattern: string): QueryBuilder {
    this.params[field] = { like: pattern };
    return this;
  }

  ilike(field: string, pattern: string): QueryBuilder {
    this.params[field] = { ilike: pattern };
    return this;
  }

  is(field: string, value: any): QueryBuilder {
    this.params[field] = { is: value };
    return this;
  }

  or(filters: string, referenceTable?: string): QueryBuilder {
    this.params.or = filters;
    return this;
  }

  not(field: string, operator: string, value: any): QueryBuilder {
    this.params[field] = { not: { [operator]: value } };
    return this;
  }

  fts(field: string, query: string, options?: { config?: string; type?: 'websearch' | 'plainto_tsquery' | 'phraseto_tsquery' }): QueryBuilder {
    this.params[field] = { fts: { query, ...options } };
    return this;
  }

  plfts(field: string, query: string, options?: { config?: string; type?: 'websearch' | 'plainto_tsquery' | 'phraseto_tsquery' }): QueryBuilder {
    this.params[field] = { plfts: { query, ...options } };
    return this;
  }

  phfts(field: string, query: string, options?: { config?: string; type?: 'websearch' | 'plainto_tsquery' | 'phraseto_tsquery' }): QueryBuilder {
    this.params[field] = { phfts: { query, ...options } };
    return this;
  }

  wfts(field: string, query: string, options?: { config?: string; type?: 'websearch' | 'plainto_tsquery' | 'phraseto_tsquery' }): QueryBuilder {
    this.params[field] = { wfts: { query, ...options } };
    return this;
  }

  textSearch(field: string, query: string, options?: { config?: string; type?: 'websearch' | 'plainto_tsquery' | 'phraseto_tsquery' }): QueryBuilder {
    this.params[field] = { textSearch: { query, ...options } };
    return this;
  }

  match(object: Record<string, unknown>): QueryBuilder {
    this.params.match = object;
    return this;
  }

  contains(field: string, value: object | string[] | null): QueryBuilder {
    this.params[field] = { contains: value };
    return this;
  }

  containedBy(field: string, value: object | string[]): QueryBuilder {
    this.params[field] = { containedBy: value };
    return this;
  }

  rangeGt(field: string, range: string): QueryBuilder {
    this.params[field] = { rangeGt: range };
    return this;
  }

  rangeGte(field: string, range: string): QueryBuilder {
    this.params[field] = { rangeGte: range };
    return this;
  }

  rangeLt(field: string, range: string): QueryBuilder {
    this.params[field] = { rangeLt: range };
    return this;
  }

  rangeLte(field: string, range: string): QueryBuilder {
    this.params[field] = { rangeLte: range };
    return this;
  }

  rangeAdjacent(field: string, range: string): QueryBuilder {
    this.params[field] = { rangeAdjacent: range };
    return this;
  }

  overlaps(field: string, range: string): QueryBuilder {
    this.params[field] = { overlaps: range };
    return this;
  }

  strictlyLeft(field: string, range: string): QueryBuilder {
    this.params[field] = { strictlyLeft: range };
    return this;
  }

  strictlyRight(field: string, range: string): QueryBuilder {
    this.params[field] = { strictlyRight: range };
    return this;
  }

  notExtendRight(field: string, range: string): QueryBuilder {
    this.params[field] = { notExtendRight: range };
    return this;
  }

  notExtendLeft(field: string, range: string): QueryBuilder {
    this.params[field] = { notExtendLeft: range };
    return this;
  }

  and(filters: string): QueryBuilder {
    this.params.and = filters;
    return this;
  }

  filter(column: string, operator: string, value: any): QueryBuilder {
    this.params[column] = { [operator]: value };
    return this;
  }

  select(columns?: string): QueryBuilder {
    this.params.select = columns;
    return this;
  }

  async insert(values: Partial<any> | Partial<any>[], options?: { returning?: 'minimal' | 'representation' }) {
    const baseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${baseUrl}/api/${this.tableName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: values, options })
      });

      const result = await response.json();
      return { data: result, error: response.ok ? null : result };
    } catch (error) {
      return { data: null, error };
    }
  }

  async upsert(values: Partial<any> | Partial<any>[], options?: { onConflict?: string; ignoreDuplicates?: boolean; returning?: 'minimal' | 'representation' }) {
    const baseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${baseUrl}/api/${this.tableName}/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: values, options })
      });

      const result = await response.json();
      return { data: result, error: response.ok ? null : result };
    } catch (error) {
      return { data: null, error };
    }
  }

  update(values: Partial<any>): QueryBuilder {
    return new QueryImpl(this.tableName, 'update', { ...this.params, values });
  }

  delete(): QueryBuilder {
    return new QueryImpl(this.tableName, 'delete', this.params);
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean; referencedTable?: string }): QueryBuilder {
    this.params.order = { column, ...options };
    return this;
  }

  limit(count: number, options?: { foreignTable?: string }): QueryBuilder {
    this.params.limit = { count, ...options };
    return this;
  }

  range(from: number, to: number, options?: { foreignTable?: string }): QueryBuilder {
    this.params.range = { from, to, ...options };
    return this;
  }

  async single(): Promise<{ data: any; error: any | null }> {
    const baseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${baseUrl}/api/${this.tableName}/single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.params)
      });

      const result = await response.json();
      return { data: result.data, error: response.ok ? null : result.error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async maybeSingle(): Promise<{ data: any | null; error: any | null }> {
    const baseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${baseUrl}/api/${this.tableName}/maybe-single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.params)
      });

      const result = await response.json();
      return { data: result.data || null, error: response.ok ? null : result.error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async first(): Promise<{ data: any | null; error: any | null }> {
    const baseUrl = import.meta.env.VITE_SERVER_BASE_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${baseUrl}/api/${this.tableName}/first`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.params)
      });

      const result = await response.json();
      return { data: result.data || null, error: response.ok ? null : result.error };
    } catch (error) {
      return { data: null, error };
    }
  }

  then(onfulfilled?: ((value: any) => any) | undefined, onrejected?: ((reason: any) => any) | undefined): Promise<any> {
    // Простая реализация для совместимости
    return Promise.resolve({ data: null, error: null }).then(onfulfilled, onrejected);
  }
}

class SupabaseClient {
  from(tableName: string): TableApi {
    return new TableApi(tableName);
  }

  // Добавим другие необходимые методы
  rpc(fn: string, args?: object) {
    // RPC методы
    console.warn(`RPC function ${fn} not fully implemented`);
    return new QueryImpl(fn, 'rpc', args || {});
  }
}

// Создаем клиент
export const supabase = new SupabaseClient();

export default supabase;