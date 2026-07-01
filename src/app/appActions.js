function createAppActions(setData) {
  return {
    addStudent: (student) => setData((d) => ({ ...d, students: [{ id: Date.now(), ...student, release: 'Waiting' }, ...d.students] })),
    markAttendance: (id, status) => setData((d) => ({
      ...d,
      attendanceLog: [{
        id: Date.now(),
        studentId: id,
        student: d.students.find((s) => s.id === id)?.name || 'Student',
        status,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        date: 'Today'
      }, ...d.attendanceLog],
      students: d.students.map((s) => (s.id === id ? { ...s, status } : s)),
      announcements: status === 'Absent'
        ? [{ id: Date.now(), title: 'Attendance Alert', audience: 'Parent', body: `${d.students.find((s) => s.id === id)?.name} was marked absent today.`, priority: 'High' }, ...d.announcements]
        : d.announcements
    })),
    releaseStudent: (guardianId) => setData((d) => {
      const guardian = d.guardians.find((g) => g.id === guardianId);
      if (!guardian?.verified) return d;
      const student = d.students.find((s) => s.id === guardian.studentId);
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
        }, ...d.pickupLog],
        students: d.students.map((s) => (s.id === guardian.studentId ? { ...s, release: 'Released' } : s)),
        announcements: [{ id: Date.now(), title: 'Pickup Complete', audience: 'Parent', body: `${guardian.name} picked up ${student?.name}.`, priority: 'Normal' }, ...d.announcements]
      };
    }),
    addVisitor: (visitor) => setData((d) => ({ ...d, visitors: [{ id: Date.now(), status: 'On campus', timeIn: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), timeOut: '', ...visitor }, ...d.visitors] })),
    checkoutVisitor: (id) => setData((d) => ({ ...d, visitors: d.visitors.map((v) => (v.id === id ? { ...v, status: 'Checked out', timeOut: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) } : v)) })),
    addIncident: (incident) => setData((d) => ({ ...d, incidents: [{ id: Date.now(), status: 'Submitted', ...incident }, ...d.incidents] })),
    addClinic: (record) => setData((d) => ({ ...d, clinic: [{ id: Date.now(), ...record }, ...d.clinic] })),
    addAnnouncement: (announcement) => setData((d) => ({ ...d, announcements: [{ id: Date.now(), ...announcement }, ...d.announcements] })),
    triggerEmergency: (type) => setData((d) => ({
      ...d,
      emergency: [{ id: Date.now(), type, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }, ...d.emergency],
      announcements: [{ id: Date.now() + 1, title: `${type} Emergency Alert`, audience: 'All', body: 'Follow school safety instructions immediately.', priority: 'Critical' }, ...d.announcements]
    }))
  };
}

export { createAppActions };