// Supabase клиент для работы с базой данных
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn('Supabase credentials not configured. Check environment variables.');
}

// Создаем клиент Supabase
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://jzpnqgxrjtpeywwtiuha.supabase.co',
  SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cG5xZ3hyanRwZXl3d3RpdWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTc2MzMsImV4cCI6MjA4MzI3MzYzM30.wqT9TTBnzde2REYeVfBGp2xj7tBeSwcFdyWp-mTYufk'
);

export default supabase;
