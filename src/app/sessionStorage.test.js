import test from 'node:test';
import assert from 'node:assert/strict';

import { readSessionFromStorage, writeSessionToStorage } from './sessionStorage.js';

test('writes and reads a signed-in session from storage', () => {
  const storage = {};
  const session = {
    signedIn: true,
    role: 'Teacher',
    fullName: 'Ana Cruz',
    email: 'ana@school.edu.ph'
  };

  writeSessionToStorage(session, storage);
  const restored = readSessionFromStorage(storage);

  assert.deepEqual(restored, session);
});

test('returns null when storage is empty', () => {
  const storage = {};
  assert.equal(readSessionFromStorage(storage), null);
});
