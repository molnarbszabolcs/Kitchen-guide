import { createClient } from '@supabase/supabase-js';

const normalize = (value: string | undefined) =>
  (value || '').split(/\s+/)[0].trim(); // ha szóköz/”name” került a végére, levágjuk

const supabaseUrl = normalize(import.meta.env.VITE_SUPABASE_URL);
const supabaseKey = normalize(import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
