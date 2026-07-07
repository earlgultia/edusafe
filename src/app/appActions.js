function createAppActions(setData) {
  return {
    addNotification: (note) => setData((d) => ({ ...d, notifications: [{ id: Date.now(), read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), ...note }, ...(d.notifications || [])] })),
    markNotificationRead: (id) => setData((d) => ({ ...d, notifications: (d.notifications || []).map((n) => (n.id === id ? { ...n, read: true } : n)) })),
    addStudent: (student) => setData((d) => ({ ...d, students: [{ id: Date.now(), ...student, release: 'Waiting' }, ...(d.students || [])] })),
    addTeacher: (teacher) => setData((d) => ({ ...d, teachers: [{ id: Date.now(), ...teacher }, ...(d.teachers || [])] })),
    addGuardian: (guardian) => setData((d) => {
      const normalizedStudentId = typeof guardian.studentId === 'string' && /^\d+$/.test(guardian.studentId)
        ? Number(guardian.studentId)
        : guardian.studentId;
      return {
        ...d,
        guardians: [{
          id: Date.now(),
          qr: `GDN-${guardian.name.split(' ')[0].toUpperCase()}-${normalizedStudentId}-${Date.now()}`,
          ...guardian,
          studentId: normalizedStudentId
        }, ...(d.guardians || [])]
      };
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
    markAttendance: (id, status) => setData((d) => ({
      ...d,
      attendanceLog: [{
        id: Date.now(),
        studentId: id,
        student: (d.students || []).find((s) => s.id === id)?.name || 'Student',
        status,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        date: 'Today'
      }, ...(d.attendanceLog || [])],
      students: (d.students || []).map((s) => (s.id === id ? { ...s, status } : s)),
      announcements: status === 'Absent'
        ? [{ id: Date.now(), title: 'Attendance Alert', audience: 'Parent', body: `${(d.students || []).find((s) => s.id === id)?.name} was marked absent today.`, priority: 'High' }, ...(d.announcements || [])]
        : (d.announcements || []),
      notifications: [{ id: Date.now(), type: 'attendance', title: `${(d.students || []).find((s) => s.id === id)?.name} marked ${status}`, body: `${(d.students || []).find((s) => s.id === id)?.name} was marked ${status}.`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])]
    })),
    releaseStudent: (guardianId) => setData((d) => {
      const guardian = (d.guardians || []).find((g) => g.id === guardianId);
      if (!guardian?.verified) return d;
      const student = (d.students || []).find((s) => s.id === guardian.studentId);
      return {
        ...d,
        pickupLog: [{
          id: Date.now(),
          studentId: guardian.studentId,
          student: student?.name || 'Student',
          guardian: guardian.name,
          status: 'Released',
          time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          date: 'Today'
        }, ...(d.pickupLog || [])],
        students: (d.students || []).map((s) => (s.id === guardian.studentId ? { ...s, release: 'Released' } : s)),
        announcements: [{ id: Date.now(), title: 'Pickup Complete', audience: 'Parent', body: `${guardian.name} picked up ${student?.name}.`, priority: 'Normal' }, ...(d.announcements || [])],
        notifications: [{ id: Date.now(), type: 'pickup', title: 'Student released', body: `${guardian.name} picked up ${student?.name}.`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])]
      };
    }),
    addVisitor: (visitor) => setData((d) => ({ ...d, visitors: [{ id: Date.now(), status: 'On campus', timeIn: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), timeOut: '', ...visitor }, ...(d.visitors || [])], notifications: [{ id: Date.now(), type: 'visitor', title: 'Visitor arrived', body: `${visitor.name} arrived for ${visitor.purpose || 'a meeting'}.`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])] })),
    checkoutVisitor: (id) => setData((d) => ({ ...d, visitors: (d.visitors || []).map((v) => (v.id === id ? { ...v, status: 'Checked out', timeOut: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) } : v)) })),
    addIncident: (incident) => setData((d) => ({ ...d, incidents: [{ id: Date.now(), status: 'Submitted', ...incident }, ...(d.incidents || [])], notifications: [{ id: Date.now(), type: 'incident', title: 'Incident reported', body: `${incident.student || 'A student'} - ${incident.type}`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])] })),
    addClinic: (record) => setData((d) => ({ ...d, clinic: [{ id: Date.now(), ...record }, ...(d.clinic || [])], notifications: [{ id: Date.now(), type: 'clinic', title: 'Clinic visit', body: `${record.student || 'A student'} visited the clinic.`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])] })),
    addAnnouncement: (announcement) => {
      setData((d) => ({ ...d, announcements: [{ id: Date.now(), ...announcement }, ...(d.announcements || [])], notifications: [{ id: Date.now(), type: 'announcement', title: announcement.title || 'Announcement', body: announcement.body || '', read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])] }));

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
    addEvent: (event) => setData((d) => ({ ...d, events: [{ id: Date.now(), ...event }, ...(d.events || [])], notifications: [{ id: Date.now(), type: 'event', title: event.title || 'Event', body: `${event.title} on ${event.date}`, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])] })),
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
    triggerEmergency: (type, message = 'Follow school safety instructions immediately.') => setData((d) => ({
      ...d,
      emergency: [{ id: Date.now(), type, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), message }, ...(d.emergency || [])],
      announcements: [{ id: Date.now() + 1, title: `${type} Emergency Alert`, audience: 'All', body: message, priority: 'Critical' }, ...(d.announcements || [])],
      notifications: [{ id: Date.now(), type: 'emergency', title: `${type} Emergency`, body: message, read: false, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.notifications || [])],
      pushLog: [{ id: Date.now(), payload: { channel: 'all', title: `${type} Emergency`, body: message }, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.pushLog || [])]
    }))
    ,
    acknowledgeEmergency: (alertId, user) => setData((d) => ({
      ...d,
      emergencyAcks: [{ id: Date.now(), alertId, user, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.emergencyAcks || [])]
    })),
    sendPushMock: (payload) => setData((d) => ({
      ...d,
      pushLog: [{ id: Date.now(), payload, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...(d.pushLog || [])]
    }))
  };
}

export { createAppActions };