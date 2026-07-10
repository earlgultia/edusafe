function canPerformAction(role = '', action = '', context = {}) {
  const normalizedRole = String(role || '').trim().toLowerCase();
  const normalizedAction = String(action || '').trim().toLowerCase();

  const permissionMatrix = {
    admin: ['attendance', 'incident', 'clinic', 'announcement', 'emergency', 'visitor', 'pickup', 'guardian', 'student', 'teacher'],
    teacher: ['attendance', 'incident', 'announcement', 'visitor', 'student'],
    parent: [],
    guard: ['visitor', 'pickup'],
    nurse: ['clinic', 'incident', 'student']
  };

  const allowed = permissionMatrix[normalizedRole] || [];
  if (normalizedAction === 'attendance' && normalizedRole === 'parent') return false;
  if (normalizedAction === 'pickup' && normalizedRole === 'parent') return false;
  if (normalizedAction === 'clinic' && normalizedRole === 'parent') return false;

  if (normalizedAction === 'guardian') {
    return ['admin', 'teacher'].includes(normalizedRole);
  }

  if (normalizedAction === 'student' && normalizedRole === 'teacher') {
    return Boolean(context.classScope || context.teacherId);
  }

  return allowed.includes(normalizedAction);
}

function buildOfflineQueueEntry(action, payload = {}, context = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    action,
    payload,
    context,
    queuedAt: new Date().toISOString(),
    status: 'queued'
  };
}

function queueOfflineAction(state = {}, action, payload = {}, context = {}) {
  return {
    ...state,
    offlineQueue: [buildOfflineQueueEntry(action, payload, context), ...(state.offlineQueue || [])]
  };
}

export { buildOfflineQueueEntry, canPerformAction, queueOfflineAction };
