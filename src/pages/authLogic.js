const ROLE_PATTERNS = [
  { role: 'Admin', regex: /(^|[._@-])(admin|principal|headmaster|head)([._@-]|$)/i },
  { role: 'Teacher', regex: /(^|[._@-])(teacher|adviser|faculty|staff)([._@-]|$)/i },
  { role: 'Guard', regex: /(^|[._@-])(guard|security|watchman|bantay)([._@-]|$)/i },
  { role: 'Nurse', regex: /(^|[._@-])(nurse|clinic|medical|health)([._@-]|$)/i },
  { role: 'Parent', regex: /(^|[._@-])(parent|guardian|mother|father|mom|dad)([._@-]|$)/i }
];

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

function validateLoginForm(values) {
  const email = String(values?.email || '').trim();
  const password = String(values?.password || '').trim();

  if (!email) return { ok: false, message: 'Please enter your email address.' };
  if (!password) return { ok: false, message: 'Please enter your password.' };

  const role = inferRoleFromAccount(email, values?.fallbackRole || 'Parent');
  return { ok: true, role, message: '' };
}

function validateRegisterForm(values) {
  const fullName = String(values?.fullName || '').trim();
  const email = String(values?.email || '').trim();
  const password = String(values?.password || '').trim();
  const confirmPassword = String(values?.confirmPassword || '').trim();
  const phone = String(values?.mobile || values?.phone || '').trim();

  if (!fullName) return { ok: false, message: 'Please enter your full name.' };
  if (!email) return { ok: false, message: 'Please enter your email address.' };
  if (!password) return { ok: false, message: 'Please create a password.' };
  if (password !== confirmPassword) return { ok: false, message: 'Passwords must match.' };
  if (!phone) return { ok: false, message: 'Please enter your mobile number.' };

  const detectedRole = inferRoleFromAccount(email, values?.fallbackRole || 'Parent');
  const role = detectedRole === 'Parent' ? 'Parent' : detectedRole;
  return { ok: true, role, message: '' };
}

export { inferRoleFromAccount, validateLoginForm, validateRegisterForm };