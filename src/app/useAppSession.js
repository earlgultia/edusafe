import { useEffect, useState } from 'react';

import { clearSessionFromStorage, readSessionFromStorage, writeSessionToStorage } from './sessionStorage.js';

const KNOWN_ROLES = ['Admin', 'Teacher', 'Parent', 'Guard', 'Nurse'];

function normalizeRole(role, fallback = 'Admin') {
  const normalized = String(role || '').trim();
  const matched = KNOWN_ROLES.find((knownRole) => knownRole.toLowerCase() === normalized.toLowerCase());
  return matched || fallback;
}

function useAppSession() {
  const [tab, setTab] = useState('dashboard');
  const [auth, setAuth] = useState({ signedIn: false, role: 'Admin', fullName: 'Guest', email: '' });
  const [sheet, setSheet] = useState(null);
  const [entryView, setEntryView] = useState('landing');
  const [entryRole, setEntryRole] = useState('Admin');

  useEffect(() => {
    const storedSession = readSessionFromStorage();
    if (storedSession?.signedIn) {
      setAuth({
        signedIn: true,
        role: normalizeRole(storedSession.role, 'Admin'),
        fullName: storedSession.fullName || 'Guest',
        email: storedSession.email || ''
      });
      setEntryView('landing');
    }
  }, []);

  useEffect(() => {
    if (!auth.signedIn) {
      clearSessionFromStorage();
      return;
    }

    writeSessionToStorage(auth);
  }, [auth]);

  const signIn = (account) => {
    const nextAccount = typeof account === 'string'
      ? { role: account, fullName: 'User', email: '' }
      : account;

    setAuth({
      signedIn: true,
      role: normalizeRole(nextAccount.role, 'Admin'),
      fullName: nextAccount.fullName || 'User',
      email: nextAccount.email || ''
    });
    setTab('dashboard');
    setEntryView('landing');
    // Initialize native push registration (best-effort)
    (async () => {
      try {
        const mod = await import('../lib/nativePush.js');
        if (mod && typeof mod.initNativePush === 'function') {
          const result = await mod.initNativePush({ email: nextAccount.email || '', role: nextAccount.role || '' });
          // expose simulation helper in dev for manual testing
          if (typeof window !== 'undefined' && import.meta?.env?.DEV && typeof mod.simulatePushForDev === 'function') {
            try { window.__simulatePush = mod.simulatePushForDev; } catch (e) { /* ignore */ }
          }
          void result;
        }
      } catch (e) {
        // ignore failures in web/dev environments
      }
    })();
  };

  const signOut = () => {
    setAuth({ signedIn: false, role: 'Admin', fullName: 'Guest', email: '' });
    setSheet(null);
    setTab('dashboard');
    setEntryView('login');
  };

  return {
    tab,
    setTab,
    auth,
    setAuth,
    sheet,
    setSheet,
    entryView,
    setEntryView,
    entryRole,
    setEntryRole,
    signIn,
    signOut
  };
}

export { useAppSession };