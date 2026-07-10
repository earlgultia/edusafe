function normalizeDate(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);

  const text = String(value).trim();
  if (!text) return '';
  if (/^today$/i.test(text)) return 'today';

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return text.toLowerCase();
}

function buildAuditEntry(action, details = {}, state = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    action,
    actor: details.actor || 'system',
    school: state.school?.name || state.school?.id || 'unknown',
    timestamp: new Date().toISOString(),
    details
  };
}

function appendAuditEntry(state = {}, entry) {
  return {
    ...state,
    auditLog: [entry, ...(state.auditLog || [])]
  };
}

function hasDuplicateAttendance(state = {}, studentId, dateValue = 'Today') {
  const targetDate = normalizeDate(dateValue);
  return (state.attendanceLog || []).some((entry) => {
    const sameStudent = String(entry.studentId || '') === String(studentId || '');
    const sameDate = normalizeDate(entry.date || entry.dateKey || '') === targetDate;
    return sameStudent && sameDate;
  });
}

function addBusinessAudit(state = {}, action, details = {}, actor = 'system') {
  return appendAuditEntry(state, buildAuditEntry(action, { ...details, actor }, state));
}

export { addBusinessAudit, appendAuditEntry, buildAuditEntry, hasDuplicateAttendance, normalizeDate };
