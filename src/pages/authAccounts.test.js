import test from 'node:test';
import assert from 'node:assert/strict';

import { authenticateAccount, registerAccount } from './authAccounts.js';

test('registers a new account and authenticates it later', () => {
  const created = registerAccount({
    fullName: 'Mina Santos',
    email: 'mina@school.edu.ph',
    schoolId: 'ESP-2026-001',
    password: 'Secure123!',
    role: 'Parent'
  });

  assert.equal(created.ok, true);

  const authenticated = authenticateAccount({
    schoolId: 'ESP-2026-001',
    email: 'mina@school.edu.ph',
    password: 'Secure123!'
  });

  assert.equal(authenticated.ok, true);
  assert.equal(authenticated.role, 'Parent');
});

test('rejects a wrong password for an existing account', () => {
  registerAccount({
    fullName: 'Luis Cruz',
    email: 'luis@school.edu.ph',
    schoolId: 'ESP-2026-002',
    password: 'Password123!',
    role: 'Teacher'
  });

  const authenticated = authenticateAccount({
    schoolId: 'ESP-2026-002',
    email: 'luis@school.edu.ph',
    password: 'WrongPass'
  });

  assert.equal(authenticated.ok, false);
  assert.match(authenticated.message, /password/i);
});
