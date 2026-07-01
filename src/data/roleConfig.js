const roleProfiles = {
  Admin: { title: 'Principal access', subtitle: 'School setup, users, reports, and emergency controls.' },
  Teacher: { title: 'Teacher access', subtitle: 'Attendance, dismissal, incidents, announcements, and forms.' },
  Parent: { title: 'Parent access', subtitle: 'Attendance updates, pickup history, announcements, and alerts.' },
  Guard: { title: 'Guard access', subtitle: 'Visitor registration, QR verification, and campus entry logging.' },
  Nurse: { title: 'Clinic access', subtitle: 'Student visits, medicine logs, and health monitoring.' }
};

const roleTabs = {
  Admin: ['dashboard', 'people', 'safety', 'comms', 'reports'],
  Teacher: ['dashboard', 'people', 'safety', 'comms'],
  Parent: ['dashboard', 'comms'],
  Guard: ['dashboard', 'safety'],
  Nurse: ['dashboard', 'safety']
};

export { roleProfiles, roleTabs };
