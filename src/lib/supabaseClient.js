import { createClient } from '@supabase/supabase-js';

import { getSupabaseConfig } from './supabaseConfig.js';

const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables are missing.');
}

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

export { supabase };
