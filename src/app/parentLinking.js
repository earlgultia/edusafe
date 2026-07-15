function normalizeIdentifier(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function collectIdentifiers(value, fallbackValues = []) {
  const candidates = [value, ...(Array.isArray(fallbackValues) ? fallbackValues : [fallbackValues])]
    .filter(Boolean)
    .map((candidate) => normalizeIdentifier(candidate));

  return Array.from(new Set(candidates.filter(Boolean)));
}

function hasAnyIdentifier(values = []) {
  return values.some((value) => Boolean(normalizeIdentifier(value)));
}

function getNameIdentifier(value) {
  return normalizeIdentifier(value || '');
}

function isGuardianLinkedToAuth(guardian, auth = {}) {
  if (!guardian) return false;

  const authIdentifiers = collectIdentifiers(auth?.email, [
    auth?.id,
    auth?.userId,
    auth?.parentId,
    auth?.guardianId,
    auth?.phone,
    auth?.mobile,
    auth?.contact,
    auth?.parentPhone,
    auth?.guardianPhone
  ]);
  const guardianIdentifiers = collectIdentifiers(guardian.email, [
    guardian.authId || guardian.parentId || guardian.userId,
    guardian.id,
    guardian.guardianId,
    guardian.phone,
    guardian.mobile,
    guardian.contact,
    guardian.parentPhone,
    guardian.guardianPhone
  ]);

  if (guardianIdentifiers.some((identifier) => authIdentifiers.includes(identifier))) {
    return true;
  }

  const authNameIdentifier = getNameIdentifier(auth?.fullName || auth?.name || auth?.userName || auth?.displayName);
  const guardianNameIdentifier = getNameIdentifier(guardian.name || guardian.fullName || guardian.parentName || guardian.guardianName || guardian.displayName);

  if (authNameIdentifier && guardianNameIdentifier && authNameIdentifier === guardianNameIdentifier) {
    return true;
  }

  return false;
}

function isStudentLinkedToAuth(student, guardians = [], auth = {}) {
  if (!student) return false;

  const authIdentifiers = collectIdentifiers(auth?.email, [
    auth?.id,
    auth?.userId,
    auth?.parentId,
    auth?.guardianId,
    auth?.phone,
    auth?.mobile,
    auth?.contact,
    auth?.parentPhone,
    auth?.guardianPhone
  ]);

  const studentIdentifiers = collectIdentifiers(student.parentEmail || student.guardianEmail || student.guardian || '', [
    student.parentId || student.guardianId || student.authId || student.userId || '',
    student.email || '',
    student.parentPhone || student.guardianPhone || student.phone || ''
  ]);

  if (studentIdentifiers.some((identifier) => authIdentifiers.includes(identifier))) {
    return true;
  }

  const authNameIdentifier = getNameIdentifier(auth?.fullName || auth?.name || auth?.userName || auth?.displayName);
  const studentNameIdentifier = getNameIdentifier(student.parentName || student.guardianName || student.parentFullName || student.guardianFullName || student.guardian || student.guardianEmail || student.parentEmail || student.name || '');

  if (authNameIdentifier && studentNameIdentifier && authNameIdentifier === studentNameIdentifier) {
    return true;
  }

  return (guardians || []).some((guardian) => {
    if (!isGuardianLinkedToAuth(guardian, auth)) return false;
    return String(guardian.studentId || '') === String(student.id);
  });
}

function getLinkedStudentIds(students = [], guardians = [], auth = {}) {
  return Array.from(new Set(
    students
      .filter((student) => isStudentLinkedToAuth(student, guardians, auth))
      .map((student) => String(student.id))
      .filter(Boolean)
  ));
}

export { getLinkedStudentIds, isGuardianLinkedToAuth, isStudentLinkedToAuth, normalizeIdentifier };
