import test from 'node:test';
import assert from 'node:assert/strict';

import { authenticateAccount, buildAccountFromSupabaseUser, registerAccount } from './authAccounts.js';

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
