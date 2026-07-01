function getSupabaseConfig() {
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
  return {
    url: env.VITE_SUPABASE_URL || '',
    key: env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
  };
}

export { getSupabaseConfig };
