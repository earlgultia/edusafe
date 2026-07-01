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

function registerAccount(account) {
  const accounts = readAccounts();
  const normalizedEmail = String(account.email || '').trim().toLowerCase();
  const normalizedSchoolId = String(account.schoolId || '').trim();
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
    role: account.role
  };

  writeAccounts([...accounts, nextAccount]);
  return { ok: true, account: nextAccount };
}

function authenticateAccount({ schoolId, email, password }) {
  const accounts = readAccounts();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedSchoolId = String(schoolId || '').trim();
  const account = accounts.find((item) => String(item.schoolId || '').trim() === normalizedSchoolId && String(item.email || '').toLowerCase() === normalizedEmail);

  if (!account) {
    return { ok: false, message: 'We could not find an account with those details.' };
  }

  if (account.password !== String(password || '')) {
    return { ok: false, message: 'The password you entered is incorrect.' };
  }

  return { ok: true, role: account.role, account };
}

export { authenticateAccount, registerAccount, readAccounts, writeAccounts };
