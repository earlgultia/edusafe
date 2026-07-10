import { createClient } from '@supabase/supabase-js';

import { getSupabaseConfig } from './supabaseConfig.js';

const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);

if (!hasSupabaseConfig) {
  console.warn('Supabase environment variables are missing.');
}

const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

export { supabase };
