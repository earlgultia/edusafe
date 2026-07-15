const ROLE_PATTERNS = [
  { role: 'Admin', regex: /(^|[._@-])(admin|principal|headmaster|head)([._@-]|$)/i },
  { role: 'Teacher', regex: /(^|[._@-])(teacher|adviser|faculty|staff)([._@-]|$)/i },
  { role: 'Guard', regex: /(^|[._@-])(guard|security|watchman|bantay)([._@-]|$)/i },
  { role: 'Nurse', regex: /(^|[._@-])(nurse|clinic|medical|health)([._@-]|$)/i },
  { role: 'Parent', regex: /(^|[._@-])(parent|guardian|mother|father|mom|dad)([._@-]|$)/i }
];

const KNOWN_ROLES = ['Admin', 'Teacher', 'Parent', 'Guard', 'Nurse'];

const FORBIDDEN_INPUT_PATTERN = /[<>'"`;]/;
const MAX_INPUT_LENGTH = 160;

function sanitizeText(value) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return text.length > MAX_INPUT_LENGTH ? text.slice(0, MAX_INPUT_LENGTH) : text;
}

function isSafeInput(value) {
  const text = sanitizeText(value);
  if (!text) return false;
  return !FORBIDDEN_INPUT_PATTERN.test(text);
}

function inferRoleFromAccount(email, fallbackRole = 'Parent') {
  const value = String(email || '').trim().toLowerCase();
  const localPart = value.split('@')[0] || value;

  for (const { role, regex } of ROLE_PATTERNS) {
    if (regex.test(value) || regex.test(localPart)) return role;
  }

  const normalizedFallback = String(fallbackRole || '').trim();
  if (ROLE_PATTERNS.some(({ role }) => role === normalizedFallback)) {
    return normalizedFallback;
  }

  return 'Parent';
}

function normalizeRoleValue(role, fallbackRole = 'Parent') {
  const normalized = String(role || '').trim();
  const matched = KNOWN_ROLES.find((knownRole) => knownRole.toLowerCase() === normalized.toLowerCase());
  return matched || fallbackRole || 'Parent';
}

function resolveAccountRole(accountRole, email, fallbackRole = 'Parent') {
  const normalizedStoredRole = normalizeRoleValue(accountRole, 'Parent');
  if (normalizedStoredRole !== 'Parent') {
    return normalizedStoredRole;
  }

  const normalizedFallbackRole = normalizeRoleValue(fallbackRole, 'Parent');
  if (normalizedFallbackRole !== 'Parent') {
    return normalizedFallbackRole;
  }

  return inferRoleFromAccount(email, 'Parent');
}

function validateLoginForm(values) {
  const email = sanitizeText(values?.email);
  const password = sanitizeText(values?.password);

  if (!email) return { ok: false, message: 'Please enter your email address.' };
  if (!password) return { ok: false, message: 'Please enter your password.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'Please enter a valid email address.' };
  if (!isSafeInput(email) || !isSafeInput(password)) return { ok: false, message: 'Please enter valid login details.' };

  const role = inferRoleFromAccount(email, values?.fallbackRole || 'Parent');
  return { ok: true, role, message: '' };
}

function validateRegisterForm(values) {
  const fullName = sanitizeText(values?.fullName);
  const email = sanitizeText(values?.email);
  const password = sanitizeText(values?.password);
  const confirmPassword = sanitizeText(values?.confirmPassword);
  const phone = sanitizeText(values?.mobile || values?.phone);

  if (!fullName) return { ok: false, message: 'Please enter your full name.' };
  if (!email) return { ok: false, message: 'Please enter your email address.' };
  if (!password) return { ok: false, message: 'Please create a password.' };
  if (password !== confirmPassword) return { ok: false, message: 'Passwords must match.' };
  if (!phone) return { ok: false, message: 'Please enter your mobile number.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'Please enter a valid email address.' };
  if (!/^[0-9+\-()\s]{6,15}$/.test(phone)) return { ok: false, message: 'Please enter a valid mobile number.' };
  if (!isSafeInput(fullName) || !isSafeInput(email) || !isSafeInput(password) || !isSafeInput(confirmPassword) || !isSafeInput(phone)) {
    return { ok: false, message: 'Please enter valid account details.' };
  }
  if (password.length < 8) return { ok: false, message: 'Password must be at least 8 characters long.' };

  const detectedRole = inferRoleFromAccount(email, values?.fallbackRole || 'Parent');
  const role = detectedRole === 'Parent' ? 'Parent' : detectedRole;
  return { ok: true, role, message: '' };
}

export { inferRoleFromAccount, resolveAccountRole, validateLoginForm, validateRegisterForm };