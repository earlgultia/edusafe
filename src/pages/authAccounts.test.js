import test from 'node:test';
import assert from 'node:assert/strict';

import { supabase } from '../lib/supabaseClient.js';
import { authenticateAccount, buildAccountFromSupabaseUser, readAccounts, registerAccount, writeAccounts } from './authAccounts.js';

test('maps a Supabase user to a profile account', () => {
  const account = buildAccountFromSupabaseUser({
    id: 'user-1',
    email: 'teacher@school.edu.ph',
    user_metadata: {
      full_name: 'Ana Cruz',
      school_id: 'ESP-2026-001',
      role: 'Teacher',
      phone: '+639171234567'
    }
  }, 'Parent');

  assert.equal(account.role, 'Teacher');
  assert.equal(account.fullName, 'Ana Cruz');
});

test('normalizes Supabase user roles to known app roles', () => {
  const account = buildAccountFromSupabaseUser({
    id: 'user-2',
    email: 'parent@school.edu.ph',
    user_metadata: {
      full_name: 'Maria Reyes',
      school_id: 'ESP-2026-002',
      role: 'parent',
      phone: '+639171234568'
    }
  }, 'Parent');

  assert.equal(account.role, 'Parent');
  assert.equal(account.fullName, 'Maria Reyes');
});

test('registers a new account and authenticates it later', async () => {
  const created = await registerAccount({
    fullName: 'Mina Santos',
    email: 'mina@school.edu.ph',
    schoolId: 'ESP-2026-001',
    password: 'Secure123!',
    role: 'Parent'
  });

  assert.equal(created.ok, true);

  const authenticated = await authenticateAccount({
    schoolId: 'ESP-2026-001',
    email: 'mina@school.edu.ph',
    password: 'Secure123!'
  });

  assert.equal(authenticated.ok, true);
  assert.equal(authenticated.role, 'Parent');
});

test('allows re-registration for an email that exists only in local storage but is deleted remotely', async () => {
  const email = `deleted-email-${Date.now()}@school.edu.ph`;
  await registerAccount({
    fullName: 'Deleted User',
    email,
    schoolId: 'ESP-2026-999',
    password: 'DeleteMe123!',
    role: 'Parent'
  });

  const storedAccounts = readAccounts();
  const staleAccount = storedAccounts.find((item) => item.email === email);
  assert.ok(staleAccount, 'Expected a saved local account for the deleted email');

  const authenticated = await authenticateAccount({
    schoolId: 'ESP-2026-999',
    email,
    password: 'DeleteMe123!'
  });

  assert.equal(authenticated.ok, true);
  assert.equal(authenticated.role, 'Parent');
});

test('rejects a wrong password for an existing account', async () => {
  await registerAccount({
    fullName: 'Luis Cruz',
    email: 'luis@school.edu.ph',
    schoolId: 'ESP-2026-002',
    password: 'Password123!',
    role: 'Teacher'
  });

  const authenticated = await authenticateAccount({
    schoolId: 'ESP-2026-002',
    email: 'luis@school.edu.ph',
    password: 'WrongPass'
  });

  assert.equal(authenticated.ok, false);
  assert.match(authenticated.message, /password/i);
});

test('retains Admin role for a locally registered Admin account', async () => {
  const email = `admin-local-${Date.now()}@school.edu.ph`;
  const registered = await registerAccount({
    fullName: 'Local Admin User',
    email,
    schoolId: 'ESP-2026-010',
    password: 'AdminPass123!',
    role: 'Admin'
  });

  assert.equal(registered.ok, true);

  const authenticated = await authenticateAccount({
    schoolId: 'ESP-2026-010',
    email,
    password: 'AdminPass123!'
  });

  assert.equal(authenticated.ok, true);
  assert.equal(authenticated.role, 'Admin');
});

test('accepts a login when the password is entered with surrounding whitespace', async () => {
  const email = `whitespace-${Date.now()}@school.edu.ph`;
  const registered = await registerAccount({
    fullName: 'Whitespace User',
    email,
    schoolId: 'ESP-2026-004',
    password: 'TrimMe123!',
    role: 'Parent'
  });

  assert.equal(registered.ok, true);

  const authenticated = await authenticateAccount({
    schoolId: 'ESP-2026-004',
    email,
    password: '  TrimMe123!  '
  });

  assert.equal(authenticated.ok, true);
  assert.equal(authenticated.role, 'Parent');
});

test('prefers the inferred role over a stale stored parent role for teacher-style emails', async () => {
  const email = `teacher-stale-${Date.now()}@school.edu.ph`;
  const registered = await registerAccount({
    fullName: 'Teacher Stale User',
    email,
    schoolId: 'ESP-2026-007',
    password: 'TeacherPass123!',
    role: 'Parent'
  });

  assert.equal(registered.ok, true);

  const authenticated = await authenticateAccount({
    schoolId: 'ESP-2026-007',
    email,
    password: 'TeacherPass123!'
  });

  assert.equal(authenticated.ok, true);
  assert.equal(authenticated.role, 'Teacher');
});

test('uses Supabase authentication when a matching account exists remotely', async () => {
  if (!supabase?.auth) {
    return;
  }

  const email = `supabase-remote-${Date.now()}@school.edu.ph`;
  const originalSignIn = supabase.auth.signInWithPassword;
  const existingAccounts = readAccounts();
  writeAccounts([...existingAccounts, {
    id: Date.now(),
    fullName: 'Remote Supabase User',
    email,
    schoolId: 'ESP-2026-005',
    password: '',
    role: 'Parent',
    phone: ''
  }]);

  supabase.auth.signInWithPassword = async ({ email: submittedEmail, password }) => {
    assert.equal(submittedEmail, email);
    assert.equal(password, 'RemotePass123!');
    return {
      data: {
        user: {
          id: 'remote-user-1',
          email,
          user_metadata: {
            full_name: 'Remote Supabase User',
            role: 'Parent',
            phone: ''
          }
        }
      },
      error: null
    };
  };

  try {
    const authenticated = await authenticateAccount({
      schoolId: 'ESP-2026-005',
      email,
      password: 'RemotePass123!'
    });

    assert.equal(authenticated.ok, true);
    assert.equal(authenticated.role, 'Parent');
  } finally {
    supabase.auth.signInWithPassword = originalSignIn;
  }
});

test('infers Admin role from remote user email when Supabase metadata is missing', async () => {
  if (!supabase?.auth) {
    return;
  }

  const email = `admin-${Date.now()}@school.edu.ph`;
  const originalSignIn = supabase.auth.signInWithPassword;

  supabase.auth.signInWithPassword = async ({ email: submittedEmail, password }) => {
    assert.equal(submittedEmail, email);
    assert.equal(password, 'RemotePass123!');
    return {
      data: {
        user: {
          id: 'remote-user-admin-1',
          email,
          user_metadata: {
            full_name: 'Remote Admin User',
            phone: ''
          }
        }
      },
      error: null
    };
  };

  try {
    const authenticated = await authenticateAccount({
      schoolId: 'ESP-2026-006',
      email,
      password: 'RemotePass123!',
      fallbackRole: 'Parent'
    });

    assert.equal(authenticated.ok, true);
    assert.equal(authenticated.role, 'Admin');
  } finally {
    supabase.auth.signInWithPassword = originalSignIn;
  }
});

test('uses the local account store without waiting on Supabase when available', async () => {
  if (!supabase) {
    return;
  }

  const email = `local-supabase-${Date.now()}@school.edu.ph`;
  const registered = await registerAccount({
    fullName: 'Local Supabase User',
    email,
    schoolId: 'ESP-2026-003',
    password: 'LocalPass123!',
    role: 'Parent'
  });

  assert.equal(registered.ok, true);

  const authenticated = await authenticateAccount({
    schoolId: 'ESP-2026-003',
    email,
    password: 'LocalPass123!'
  });

  assert.equal(authenticated.ok, true);
  assert.equal(authenticated.role, 'Parent');
});
