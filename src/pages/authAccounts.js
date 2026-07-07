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

async function waitForRemoteResult(promise, timeoutMs = 400) {
  return await new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve({ timedOut: true }), timeoutMs);

    promise.then((result) => {
      clearTimeout(timeoutId);
      resolve(result);
    }).catch((error) => {
      clearTimeout(timeoutId);
      resolve({ error });
    });
  });
}

async function syncProfileToSupabase(account = {}, appData = null) {
  if (!supabase || typeof supabase.auth?.getUser !== 'function' || typeof supabase.auth?.updateUser !== 'function') {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }

    const metadata = {
      full_name: String(account.fullName || user.user_metadata?.full_name || '').trim(),
      school_id: String(account.schoolId || user.user_metadata?.school_id || '').trim(),
      role: String(account.role || user.user_metadata?.role || 'Parent').trim(),
      phone: String(account.phone || user.user_metadata?.phone || '').trim()
    };

    if (appData !== null) {
      metadata.app_data = appData;
    }

    await supabase.auth.updateUser({ data: metadata });
    return metadata;
  } catch {
    return null;
  }
}

async function readRemoteAppData() {
  if (!supabase || typeof supabase.auth?.getUser !== 'function') {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }

    const remoteData = user?.user_metadata?.app_data ?? user?.user_metadata?.appData;
    if (remoteData === undefined || remoteData === null || remoteData === '') {
      return null;
    }

    if (typeof remoteData === 'string') {
      try {
        return JSON.parse(remoteData);
      } catch {
        return null;
      }
    }

    return typeof remoteData === 'object' ? remoteData : null;
  } catch {
    return null;
  }
}

async function registerAccount(account) {
  const normalizedEmail = String(account.email || '').trim().toLowerCase();
  const normalizedSchoolId = String(account.schoolId || '').trim();

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
  void syncProfileToSupabase(nextAccount);

  if (supabase && typeof supabase.auth?.signUp === 'function') {
    try {
      void waitForRemoteResult(
        supabase.auth.signUp({
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
        })
      );
    } catch {
      // Ignore remote sign-up failures and keep the local account ready.
    }
  }

  return { ok: true, account: nextAccount };
}

async function authenticateAccount({ schoolId, email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedSchoolId = String(schoolId || '').trim();

  const accounts = readAccounts();
  const account = accounts.find((item) => {
    const matchesEmail = String(item.email || '').toLowerCase() === normalizedEmail;
    if (!matchesEmail) return false;
    if (!normalizedSchoolId) return true;
    return String(item.schoolId || '').trim() === normalizedSchoolId;
  });

  if (!account) {
    if (supabase && typeof supabase.auth?.signInWithPassword === 'function') {
      try {
        const remoteResult = await waitForRemoteResult(
          supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: String(password || '')
          })
        );

        if (!remoteResult?.timedOut && !remoteResult?.error && remoteResult?.data?.user) {
          const fallbackAccount = {
            id: remoteResult.data.user.id,
            fullName: remoteResult.data.user.user_metadata?.full_name || normalizedEmail,
            email: normalizedEmail,
            schoolId: normalizedSchoolId,
            role: remoteResult.data.user.user_metadata?.role || 'Parent',
            phone: remoteResult.data.user.user_metadata?.phone || ''
          };
          writeAccounts([...accounts, fallbackAccount]);
          return { ok: true, role: fallbackAccount.role, account: fallbackAccount };
        }
      } catch {
        // Fall through to the local login error below.
      }
    }

    return { ok: false, message: 'We could not find an account with those details.' };
  }

  if (account.password !== String(password || '')) {
    return { ok: false, message: 'The password you entered is incorrect.' };
  }

  void syncProfileToSupabase(account);
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

export { authenticateAccount, buildAccountFromSupabaseUser, readAccounts, readRemoteAppData, registerAccount, syncProfileToSupabase, writeAccounts };
