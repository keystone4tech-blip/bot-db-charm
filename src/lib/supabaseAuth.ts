// src/lib/supabaseAuth.ts
// Клиент Supabase для аутентификации
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. Using fallback values for development.');
}

// Создаем клиент Supabase специально для аутентификации
export const supabaseAuth = createClient(
  SUPABASE_URL || 'https://jzpnqgxrjtpeywwtiuha.supabase.co',
  SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cG5xZ3hyanRwZXl3d3RpdWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTc2MzMsImV4cCI6MjA4MzI3MzYzM30.wqT9TTBnzde2REYeVfBGp2xj7tBeSwcFdyWp-mTYufk'
);

export default supabaseAuth;
