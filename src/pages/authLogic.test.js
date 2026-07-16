import test from 'node:test';
import assert from 'node:assert/strict';

import { inferRoleFromAccount, resolveAccountRole, validateLoginForm, validateRegisterForm } from './authLogic.js';

test('infers a role from a clear email hint', () => {
  assert.equal(inferRoleFromAccount('principal@school.edu.ph', 'Parent'), 'Admin');
  assert.equal(inferRoleFromAccount('teacher@school.edu.ph', 'Parent'), 'Teacher');
});

test('infers Parent from parent or guardian email hints', () => {
  assert.equal(inferRoleFromAccount('parent@school.edu.ph', 'Admin'), 'Parent');
  assert.equal(inferRoleFromAccount('guardian@school.edu.ph', 'Teacher'), 'Parent');
});

test('falls back to the chosen role when no clear role hint exists', () => {
  assert.equal(inferRoleFromAccount('student@school.edu.ph', 'Nurse'), 'Nurse');
});

test('preserves a plain parent role when no non-parent fallback was selected', () => {
  assert.equal(resolveAccountRole('Parent', 'student@school.edu.ph', 'Parent'), 'Parent');
  assert.equal(resolveAccountRole('parent', 'guardian@school.edu.ph', 'Parent'), 'Parent');
});

test('preserves the explicit Parent role when no non-parent fallback was selected', () => {
  assert.equal(resolveAccountRole('Parent', 'teacher@school.edu.ph', 'Parent'), 'Parent');
});

test('preserves an explicitly stored Parent role even when the email hints at a teacher account', () => {
  assert.equal(resolveAccountRole('Parent', 'teacher@school.edu.ph', 'Parent'), 'Parent');
});

test('keeps a stored Parent role unless a different explicit role was chosen', () => {
  assert.equal(resolveAccountRole('Parent', 'student@school.edu.ph', 'Teacher'), 'Parent');
  assert.equal(resolveAccountRole('Parent', 'guardian@school.edu.ph', 'Admin'), 'Parent');
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

test('rejects SQL-injection-like login input', () => {
  const result = validateLoginForm({ email: "admin@example.com' OR '1'='1", password: 'whatever' });
  assert.equal(result.ok, false);
  assert.match(result.message, /valid/i);
});

test('rejects script-like registration input', () => {
  const result = validateRegisterForm({
    fullName: '<script>alert(1)</script>',
    email: 'parent@school.edu.ph',
    password: 'StrongPass123!',
    confirmPassword: 'StrongPass123!',
    mobile: '+639171234567'
  });
  assert.equal(result.ok, false);
  assert.match(result.message, /valid/i);
});
