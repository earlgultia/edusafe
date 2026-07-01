import { supabase } from '../lib/supabaseClient.js';

const ACCOUNT_STORE_KEY = 'edusafe-accounts';
let memoryAccounts = [];

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }

  return null;
}

function readAccounts() {
  const storage = getStorage();

  if (storage) {
    try {
      const saved = storage.getItem(ACCOUNT_STORE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        memoryAccounts = Array.isArray(parsed) ? parsed : [];
        return memoryAccounts;
      }
    } catch {
      return memoryAccounts;
    }
  }

  return memoryAccounts;
}

function writeAccounts(accounts) {
  memoryAccounts = accounts;

  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(ACCOUNT_STORE_KEY, JSON.stringify(accounts));
    } catch {
      // Ignore storage write failures in unsupported environments.
    }
  }
}

async function registerAccount(account) {
  const normalizedEmail = String(account.email || '').trim().toLowerCase();
  const normalizedSchoolId = String(account.schoolId || '').trim();

  if (supabase && typeof supabase.auth?.signUp === 'function') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: String(account.password || ''),
        options: {
          data: {
            full_name: String(account.fullName || '').trim(),
            school_id: normalizedSchoolId,
            role: account.role,
            phone: String(account.phone || '').trim()
          }
        }
      });

      if (!error && data?.user) {
        const nextAccount = {
          id: data.user.id,
          fullName: String(account.fullName || '').trim(),
          email: normalizedEmail,
          schoolId: normalizedSchoolId,
          password: String(account.password || ''),
          role: account.role,
          phone: String(account.phone || '').trim()
        };

        const accounts = readAccounts();
        writeAccounts([...accounts, nextAccount]);
        return { ok: true, account: nextAccount };
      }

      if (error) {
        return { ok: false, message: error.message || 'We could not create your account.' };
      }
    } catch (error) {
      return { ok: false, message: error.message || 'We could not create your account.' };
    }
  }

  const accounts = readAccounts();
  const existing = accounts.find((item) => String(item.email || '').toLowerCase() === normalizedEmail);

  if (existing) {
    return { ok: false, message: 'An account with that email already exists.' };
  }

  const nextAccount = {
    id: Date.now(),
    fullName: String(account.fullName || '').trim(),
    email: normalizedEmail,
    schoolId: normalizedSchoolId,
    password: String(account.password || ''),
    role: account.role,
    phone: String(account.phone || '').trim()
  };

  writeAccounts([...accounts, nextAccount]);
  return { ok: true, account: nextAccount };
}

async function authenticateAccount({ schoolId, email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedSchoolId = String(schoolId || '').trim();

  if (supabase && typeof supabase.auth?.signInWithPassword === 'function') {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: String(password || '')
      });

      if (!error && data?.user) {
        const account = {
          id: data.user.id,
          fullName: data.user.user_metadata?.full_name || normalizedEmail,
          email: normalizedEmail,
          schoolId: normalizedSchoolId,
          role: data.user.user_metadata?.role || 'Parent',
          phone: data.user.user_metadata?.phone || ''
        };
        return { ok: true, role: account.role, account };
      }

      if (error) {
        return { ok: false, message: error.message || 'We could not sign you in.' };
      }
    } catch (error) {
      return { ok: false, message: error.message || 'We could not sign you in.' };
    }
  }

  const accounts = readAccounts();
  const account = accounts.find((item) => String(item.schoolId || '').trim() === normalizedSchoolId && String(item.email || '').toLowerCase() === normalizedEmail);

  if (!account) {
    return { ok: false, message: 'We could not find an account with those details.' };
  }

  if (account.password !== String(password || '')) {
    return { ok: false, message: 'The password you entered is incorrect.' };
  }

  return { ok: true, role: account.role, account };
}

function buildAccountFromSupabaseUser(user, fallbackRole = 'Parent') {
  return {
    id: user?.id || null,
    fullName: user?.user_metadata?.full_name || user?.email || 'User',
    email: user?.email || '',
    schoolId: user?.user_metadata?.school_id || '',
    role: user?.user_metadata?.role || fallbackRole,
    phone: user?.user_metadata?.phone || ''
  };
}

export { authenticateAccount, buildAccountFromSupabaseUser, readAccounts, registerAccount, writeAccounts };
