const SESSION_STORAGE_KEY = 'edusafe-session';

function getStorageValue(storage, key) {
  if (!storage) return null;
  if (typeof storage.getItem === 'function') {
    return storage.getItem(key);
  }
  return storage[key] ?? null;
}

function setStorageValue(storage, key, value) {
  if (!storage) return;
  if (typeof storage.setItem === 'function') {
    storage.setItem(key, value);
    return;
  }
  storage[key] = value;
}

function removeStorageValue(storage, key) {
  if (!storage) return;
  if (typeof storage.removeItem === 'function') {
    storage.removeItem(key);
    return;
  }
  delete storage[key];
}

function readSessionFromStorage(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  const raw = getStorageValue(storage, SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeSessionToStorage(session, storage = typeof window !== 'undefined' ? window.localStorage : null) {
  try {
    setStorageValue(storage, SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage write failures in unsupported environments.
  }
}

function clearSessionFromStorage(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  try {
    removeStorageValue(storage, SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}

export { clearSessionFromStorage, readSessionFromStorage, writeSessionToStorage };
