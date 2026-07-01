import test from 'node:test';
import assert from 'node:assert/strict';

import { inferRoleFromAccount, validateLoginForm, validateRegisterForm } from './authLogic.js';

test('infers a role from a clear email hint', () => {
  assert.equal(inferRoleFromAccount('principal@school.edu.ph', 'Parent'), 'Admin');
  assert.equal(inferRoleFromAccount('teacher@school.edu.ph', 'Parent'), 'Teacher');
});

test('falls back to the chosen role when no clear role hint exists', () => {
  assert.equal(inferRoleFromAccount('student@school.edu.ph', 'Nurse'), 'Nurse');
});

test('rejects empty login fields', () => {
  const result = validateLoginForm({ email: '', password: '' });
  assert.equal(result.ok, false);
  assert.match(result.message, /email/i);
});

test('accepts a basic login payload when required fields are filled', () => {
  const result = validateLoginForm({ schoolId: 'ESP-2026-001', email: 'teacher@school.edu.ph', password: 'demo123' });
  assert.equal(result.ok, true);
  assert.equal(result.role, 'Teacher');
});

test('rejects mismatched passwords during registration', () => {
  const result = validateRegisterForm({ fullName: 'Juan', email: 'parent@school.edu.ph', password: 'demo123', confirmPassword: 'demo456' });
  assert.equal(result.ok, false);
  assert.match(result.message, /match/i);
});
