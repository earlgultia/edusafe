import { addBusinessAudit, hasDuplicateAttendance } from './businessLogic.js';
import { canPerformAction, queueOfflineAction } from './phaseTwoLogic.js';

function isEmergencyCooldownActive(state = {}, type = '') {
  const recentAlerts = (state.emergency || []).filter((alert) => {
    const sameType = String(alert.type || '').toLowerCase() === String(type || '').toLowerCase();
    const createdAt = alert.createdAt || alert.time || '';
    if (!createdAt || !sameType) return false;

    const created = new Date(createdAt);
    if (Number.isNaN(created.getTime())) return false;

    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return diffMs < 5 * 60 * 1000;
  });

  return recentAlerts.length > 0;
}

function createAppActions(setData, context = {}) {
  const withAudit = (state, action, details = {}) => addBusinessAudit(state, action, details);
  const getSchoolContext = (state) => state.school?.id || state.school?.name || '';
  const normalize = (value) => String(value || '').trim().toLowerCase();
  const getTeacherMatch = (state, student) => {
    const studentGrade = normalize(student.grade);
    const studentSection = normalize(student.section);
    const hasClassScope = Boolean(studentGrade || studentSection);

    if (!hasClassScope) {
      return (state.teachers || []).find((teacher) => {
        const teacherId = normalize(student.teacherId || teacher.id || '');
        const explicitTeacherId = normalize(student.teacherId || '');
        return explicitTeacherId && teacherId && teacherId === explicitTeacherId;
      }) || null;
    }

    return (state.teachers || []).find((teacher) => {
      const teacherGrade = normalize(teacher.grade);
      const teacherSection = normalize(teacher.section);
      const teacherId = normalize(student.teacherId || teacher.id || '');
      const explicitTeacherId = normalize(student.teacherId || '');

      if (explicitTeacherId && teacherId) {
        return teacherId === explicitTeacherId;
      }

      if (teacherGrade && studentGrade && teacherGrade !== studentGrade) return false;
      if (teacherSection && studentSection && teacherSection !== studentSection) return false;
      return Boolean(teacherGrade || teacherSection || studentGrade || studentSection);
    }) || null;
  };
  const getScopedGuardianIds = (state, studentId) => {
    const linkedGuardians = (state.guardians || []).filter((guardian) => String(guardian.studentId || '') === String(studentId || ''));
    return linkedGuardians.map((guardian) => guardian.id);
  };
  const matchesParentLink = (record = {}, auth = {}) => {
    const authValues = [
      auth?.email,
      auth?.id,
      auth?.userId,
      auth?.parentId,
      auth?.guardianId,
      auth?.phone,
      auth?.mobile,
      auth?.contact,
      auth?.parentPhone,
      auth?.guardianPhone,
      auth?.fullName,
      auth?.name,
      auth?.userName,
      auth?.displayName
    ].filter(Boolean);
    const recordValues = [
      record?.email,
      record?.authId || record?.parentId || record?.userId,
      record?.id,
      record?.guardianId,
      record?.phone,
      record?.mobile,
      record?.contact,
      record?.parentPhone,
      record?.guardianPhone,
      record?.name,
      record?.fullName,
      record?.parentName,
      record?.guardianName,
      record?.parentFullName,
      record?.guardianFullName,
      record?.guardian
    ].filter(Boolean);

    return authValues.some((value) => recordValues.some((candidate) => normalize(value) === normalize(candidate)));
  };
  const getOfflineStatus = () => {
    if (typeof navigator === 'undefined') return false;
    return typeof navigator.onLine === 'boolean' ? !navigator.onLine : false;
  };
  const ensurePermission = (state, action, details = {}, auditAction = action) => {
    const role = context?.role || state?.sessionRole || 'admin';
    if (canPerformAction(role, action, context)) {
      return { allowed: true, state };
    }

    const rejectedState = withAudit(state, auditAction, { ...details, reason: 'forbidden', role });
    return { allowed: false, state: queueOfflineAction(rejectedState, action, details, { role, offline: getOfflineStatus() }) };
  };

  return {
    addNotification: (note) => setData((d) => {
      const next = {
        ...d,
        notifications: [{ id: Date.now(), read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), ...note }, ...(d.notifications || [])]
      };

      return withAudit(next, 'addNotification', { noteTitle: note?.title || 'Notification' });
    }),
    markNotificationRead: (id) => setData((d) => ({ ...d, notifications: (d.notifications || []).map((n) => (n.id === id ? { ...n, read: true } : n)) })),
    addStudent: (student) => setData((d) => {
      const studentId = String(student.lrn || Date.now());
      const resolvedTeacher = getTeacherMatch(d, student);
      const parentEmailValue = String(student.parentEmail || student.guardianEmail || student.guardian || '').trim();
      const normalizedParentEmail = parentEmailValue.includes('@') ? parentEmailValue : '';
      const existingGuardian = normalizedParentEmail
        ? (d.guardians || []).find((guardian) => String(guardian.studentId || '') === studentId && normalize(guardian.email || '') === normalize(normalizedParentEmail))
        : null;
      const next = {
        ...d,
        students: [{
          id: studentId,
          ...student,
          release: 'Waiting',
          teacherId: resolvedTeacher?.id || student.teacherId || '',
          grade: student.grade || '',
          section: student.section || '',
          parentEmail: normalizedParentEmail,
          schoolId: getSchoolContext(d)
        }, ...(d.students || [])],
        guardians: normalizedParentEmail && !existingGuardian
          ? [{
              id: Date.now(),
              studentId,
              name: student.guardian || 'Parent',
              email: normalizedParentEmail,
              verified: true,
              schoolId: getSchoolContext(d)
            }, ...(d.guardians || [])]
          : (d.guardians || [])
      };

      return withAudit(next, 'addStudent', { studentId, studentName: student.name || studentId, teacherId: resolvedTeacher?.id || '', parentEmail: normalizedParentEmail });
    }),
    addTeacher: (teacher) => setData((d) => {
      const next = {
        ...d,
        teachers: [{ id: Date.now(), ...teacher, schoolId: getSchoolContext(d) }, ...(d.teachers || [])]
      };

      return withAudit(next, 'addTeacher', { teacherId: teacher.id || 'new-teacher' });
    }),
    addGuardian: (guardian) => setData((d) => {
      const normalizedStudentId = String(guardian.studentId || '').trim();
      const guardianName = String(guardian.name || '').trim();
      const fallbackLabel = guardianName ? guardianName.split(/\s+/)[0].toUpperCase() : 'GDN';
      const next = {
        ...d,
        guardians: [{
          id: Date.now(),
          qr: `GDN-${fallbackLabel}-${normalizedStudentId}-${Date.now()}`,
          ...guardian,
          name: guardianName || 'Guardian',
          studentId: normalizedStudentId,
          verified: Boolean(guardian.verified),
          schoolId: getSchoolContext(d)
        }, ...(d.guardians || [])]
      };

      return withAudit(next, 'addGuardian', { studentId: normalizedStudentId, guardianName: guardianName || 'Guardian' });
    }),
    unlinkStudentFromParent: (studentId, parentAuth = {}) => setData((d) => {
      const nextGuardians = (d.guardians || []).filter((guardian) => {
        const matchesStudent = String(guardian.studentId || '') === String(studentId || '');
        if (!matchesStudent) return true;
        return !matchesParentLink(guardian, parentAuth);
      });
      const nextStudents = (d.students || []).map((student) => {
        if (String(student.id) !== String(studentId || '')) return student;

        const studentLinkRecord = {
          email: student.parentEmail || student.guardianEmail || '',
          phone: student.parentPhone || student.guardianPhone || '',
          name: student.parentName || student.guardianName || student.parentFullName || student.guardianFullName || student.guardian || '',
          id: student.parentId || student.guardianId || student.authId || student.userId || '',
          parentId: student.parentId || student.guardianId || student.authId || student.userId || '',
          guardianId: student.parentId || student.guardianId || student.authId || student.userId || ''
        };

        if (!matchesParentLink(studentLinkRecord, parentAuth)) {
          return student;
        }

        const clearedStudent = { ...student };
        ['parentEmail', 'guardianEmail', 'parentId', 'guardianId', 'parentPhone', 'guardianPhone', 'guardian', 'parentName', 'guardianName', 'parentFullName', 'guardianFullName', 'authId', 'userId'].forEach((field) => {
          clearedStudent[field] = '';
        });

        return clearedStudent;
      });

      return withAudit({ ...d, students: nextStudents, guardians: nextGuardians }, 'unlinkStudentFromParent', { studentId, parentEmail: parentAuth?.email || '' });
    }),
    removeStudent: (id) => setData((d) => ({
      ...d,
      students: (d.students || []).filter((student) => student.id !== id),
      guardians: (d.guardians || []).filter((guardian) => guardian.studentId !== id)
    })),
    removeTeacher: (id) => setData((d) => ({
      ...d,
      teachers: (d.teachers || []).filter((teacher) => teacher.id !== id)
    })),
    removeGuardian: (id) => setData((d) => ({
      ...d,
      guardians: (d.guardians || []).filter((guardian) => guardian.id !== id)
    })),
    updateSchool: (school) => setData((d) => ({ ...d, school: { ...d.school, ...school } })),
    markAttendance: (id, status) => setData((d) => {
      const permissionCheck = ensurePermission(d, 'attendance', { studentId: id, status });
      if (!permissionCheck.allowed) {
        return permissionCheck.state;
      }

      const student = (d.students || []).find((s) => s.id === id);
      const linkedGuardianIds = getScopedGuardianIds(d, id);

      if (hasDuplicateAttendance(d, id, 'Today')) {
        return withAudit(d, 'markAttendance', { studentId: id, status, rejected: true, reason: 'duplicate_attendance' });
      }

      const next = {
        ...d,
        attendanceLog: [{
          id: Date.now(),
          studentId: id,
          student: student?.name || 'Student',
          status,
          time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          date: 'Today',
          schoolId: getSchoolContext(d)
        }, ...(d.attendanceLog || [])],
        students: (d.students || []).map((s) => (s.id === id ? { ...s, status } : s)),
        announcements: status === 'Absent'
          ? [{ id: Date.now(), title: 'Attendance Alert', audience: 'Parent', studentId: id, guardianIds: linkedGuardianIds, body: `${student?.name} was marked absent today.`, priority: 'High' }, ...(d.announcements || [])]
          : (d.announcements || []),
        notifications: [{ id: Date.now(), type: 'attendance', studentId: id, guardianIds: linkedGuardianIds, title: `${student?.name} marked ${status}`, body: `${student?.name} was marked ${status}.`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])]
      };

      return withAudit(next, 'markAttendance', { studentId: id, status, rejected: false });
    }),
    releaseStudent: (guardianId) => setData((d) => {
      const permissionCheck = ensurePermission(d, 'pickup', { guardianId }, 'releaseStudent');
      if (!permissionCheck.allowed) {
        return permissionCheck.state;
      }

      const guardian = (d.guardians || []).find((g) => g.id === guardianId);
      if (!guardian?.verified) return d;
      const student = (d.students || []).find((s) => s.id === guardian.studentId);
      const next = {
        ...d,
        pickupLog: [{
          id: Date.now(),
          studentId: guardian.studentId,
          student: student?.name || 'Student',
          guardian: guardian.name,
          status: 'Released',
          time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          date: 'Today',
          schoolId: getSchoolContext(d)
        }, ...(d.pickupLog || [])],
        students: (d.students || []).map((s) => (s.id === guardian.studentId ? { ...s, release: 'Released' } : s)),
        announcements: [{ id: Date.now(), title: 'Pickup Complete', audience: 'Parent', studentId: guardian.studentId, body: `${guardian.name} picked up ${student?.name}.`, priority: 'Normal' }, ...(d.announcements || [])],
        notifications: [{ id: Date.now(), type: 'pickup', title: 'Student released', studentId: guardian.studentId, body: `${guardian.name} picked up ${student?.name}.`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])]
      };

      return withAudit(next, 'releaseStudent', { guardianId, studentId: guardian.studentId });
    }),
    addVisitor: (visitor) => setData((d) => {
      const next = {
        ...d,
        visitors: [{ id: Date.now(), status: 'On campus', timeIn: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), timeOut: '', ...visitor, schoolId: getSchoolContext(d) }, ...(d.visitors || [])],
        notifications: [{ id: Date.now(), type: 'visitor', title: 'Visitor arrived', body: `${visitor.name} arrived for ${visitor.purpose || 'a meeting'}.`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])]
      };
      return withAudit(next, 'addVisitor', { visitorName: visitor.name || 'Visitor' });
    }),
    checkoutVisitor: (id) => setData((d) => {
      const permissionCheck = ensurePermission(d, 'visitor', { visitorId: id }, 'checkoutVisitor');
      if (!permissionCheck.allowed) {
        return permissionCheck.state;
      }

      const next = {
        ...d,
        visitors: (d.visitors || []).map((v) => (v.id === id ? { ...v, status: 'Checked out', timeOut: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) } : v))
      };

      return withAudit(next, 'checkoutVisitor', { visitorId: id });
    }),
    addIncident: (incident) => setData((d) => {
      const permissionCheck = ensurePermission(d, 'incident', { incidentType: incident.type || 'incident' }, 'addIncident');
      if (!permissionCheck.allowed) {
        return permissionCheck.state;
      }

      const studentId = incident.studentId || (d.students || []).find((s) => s.name === incident.student)?.id;
      const guardianIds = Array.isArray(incident.guardianIds) ? incident.guardianIds : [];
      const resolvedGuardianIds = incident.notifyAll
        ? getScopedGuardianIds(d, studentId)
        : guardianIds;
      const severity = String(incident.severity || 'Medium').toLowerCase();
      const status = severity === 'critical' ? 'Pending Review' : 'Submitted';

      const next = {
        ...d,
        incidents: [{ id: Date.now(), status, ...incident, studentId, guardianIds: resolvedGuardianIds, schoolId: getSchoolContext(d) }, ...(d.incidents || [])],
        notifications: [{ id: Date.now(), type: 'incident', title: 'Incident reported', studentId, guardianIds: resolvedGuardianIds, body: `${incident.student || 'A student'} - ${incident.type}${resolvedGuardianIds.length ? ` • Notified ${resolvedGuardianIds.length} guardian(s)` : ''}`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])]
      };

      return withAudit(next, 'addIncident', { studentId, incidentType: incident.type || 'incident', severity, status });
    }),
    addClinic: (record) => setData((d) => {
      const studentId = record.studentId || (d.students || []).find((s) => s.name === record.student)?.id;
      const next = {
        ...d,
        clinic: [{ id: Date.now(), ...record, schoolId: getSchoolContext(d) }, ...(d.clinic || [])],
        notifications: [{ id: Date.now(), type: 'clinic', title: 'Clinic visit', studentId, body: `${record.student || 'A student'} visited the clinic.`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])]
      };

      return withAudit(next, 'addClinic', { studentId, reason: record.reason || 'clinic-visit' });
    }),
    addAnnouncement: (announcement) => {
      setData((d) => {
        const scopedStudentIds = Array.isArray(announcement.studentIds)
          ? announcement.studentIds
          : [];
        const targetGuardianIds = scopedStudentIds.length
          ? (d.guardians || []).filter((guardian) => scopedStudentIds.includes(String(guardian.studentId || ''))).map((guardian) => guardian.id)
          : [];
        const next = {
          ...d,
          announcements: [{ id: Date.now(), ...announcement, schoolId: getSchoolContext(d) }, ...(d.announcements || [])],
          notifications: [{ id: Date.now(), type: 'announcement', title: announcement.title || 'Announcement', body: announcement.body || '', read: false, guardianIds: targetGuardianIds, studentIds: scopedStudentIds, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])]
        };

        return withAudit(next, 'addAnnouncement', { audience: announcement.audience || 'All' });
      });

      // Best-effort: notify backend to push to the audience
      (async () => {
        try {
          let role = (announcement.audience || 'All');
          // normalize audience options
          if (/parent/i.test(role)) role = 'Parent';
          if (/teacher/i.test(role)) role = 'Teacher';
          if (/all/i.test(role)) role = 'All';

          await fetch('/api/sendRole', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, title: announcement.title, body: announcement.body })
          });
        } catch (e) {
          // ignore network/send errors (app remains functional)
        }
      })();
    },
    addEvent: (event) => setData((d) => {
      const next = { ...d, events: [{ id: Date.now(), ...event, schoolId: getSchoolContext(d) }, ...(d.events || [])], notifications: [{ id: Date.now(), type: 'event', title: event.title || 'Event', body: `${event.title} on ${event.date}`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])] };
      return withAudit(next, 'addEvent', { eventTitle: event.title || 'Event' });
    }),
    addLostFound: (item) => setData((d) => ({
      ...d,
      lostFound: [{ id: Date.now(), status: 'Found', ...item }, ...(d.lostFound || [])],
      notifications: [{ id: Date.now(), type: 'lost', title: `Lost & Found: ${item.item || 'Item'}`, body: `New item found: ${item.item || item.description || 'see details'}`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])]
    })),
    addLostFoundServer: (item) => setData((d) => ({
      ...d,
      lostFound: [{ ...item }, ...(d.lostFound || [])]
    })),
    setLostFound: (items) => setData((d) => ({ ...d, lostFound: items })),
    claimLostItem: (itemId, claimant = 'Someone', contact = '') => setData((d) => ({
      ...d,
      lostFound: (d.lostFound || []).map((it) => (it.id === itemId ? { ...it, status: 'Claimed', claim: { claimant, contact, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) } } : it)),
      notifications: [{ id: Date.now(), type: 'lost', title: `Claim: ${claimant}`, body: `${claimant} claims item ${itemId}`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])]
    })),
    verifyReturn: (itemId, verifier = 'Staff') => setData((d) => ({
      ...d,
      lostFound: (d.lostFound || []).map((it) => (it.id === itemId ? { ...it, status: 'Returned', returnedBy: verifier, returnedAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) } : it)),
      notifications: [{ id: Date.now(), type: 'lost', title: `Returned: ${itemId}`, body: `Item ${itemId} marked returned by ${verifier}`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])]
    })),
    triggerEmergency: (type, message = 'Follow school safety instructions immediately.') => setData((d) => {
      const permissionCheck = ensurePermission(d, 'emergency', { emergencyType: type }, 'triggerEmergency');
      if (!permissionCheck.allowed) {
        return permissionCheck.state;
      }

      if (isEmergencyCooldownActive(d, type)) {
        const cooldownState = withAudit(d, 'triggerEmergency', { emergencyType: type, reason: 'cooldown' });
        return queueOfflineAction(cooldownState, 'triggerEmergency', { emergencyType: type, message }, { role: context?.role || d?.sessionRole || 'admin', offline: getOfflineStatus() });
      }

      const next = {
        ...d,
        emergency: [{ id: Date.now(), type, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), message, createdAt: new Date().toISOString() }, ...(d.emergency || [])],
        announcements: [{ id: Date.now() + 1, title: `${type} Emergency Alert`, audience: 'All', body: message, priority: 'Critical' }, ...(d.announcements || [])],
        notifications: [{ id: Date.now(), type: 'emergency', title: `${type} Emergency`, body: message, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])],
        pushLog: [{ id: Date.now(), payload: { channel: 'all', title: `${type} Emergency`, body: message }, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.pushLog || [])]
      };

      return withAudit(next, 'triggerEmergency', { emergencyType: type });
    }),
    acknowledgeEmergency: (alertId, user) => setData((d) => {
      const next = {
        ...d,
        emergencyAcks: [{ id: Date.now(), alertId, user, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.emergencyAcks || [])]
      };

      return withAudit(next, 'acknowledgeEmergency', { alertId, user });
    }),
    removeEmergency: (alertId) => setData((d) => ({
      ...d,
      emergency: (d.emergency || []).filter((alert) => alert.id !== alertId)
    })),
    removeIncident: (incidentId) => setData((d) => ({
      ...d,
      incidents: (d.incidents || []).filter((incident) => incident.id !== incidentId)
    })),
    sendPushMock: (payload) => setData((d) => ({
      ...d,
      pushLog: [{ id: Date.now(), payload, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.pushLog || [])]
    }))
  };
}

export { createAppActions };