const roleProfiles = {
  Admin: { title: 'Admin Dashboard', subtitle: 'School setup, users, reports, and emergency controls.' },
  Teacher: { title: 'Teacher Workspace', subtitle: 'Attendance, dismissal, incidents, announcements, and forms.' },
  Parent: { title: 'Parent Overview', subtitle: 'Attendance updates, pickup history, announcements, and alerts.' },
  Guard: { title: 'Guard Console', subtitle: 'Visitor registration, QR verification, and campus entry logging.' },
  Nurse: { title: 'Nurse Station', subtitle: 'Student visits, medicine logs, and health monitoring.' }
};

const roleNavigation = {
  Admin: [
    { tab: 'home', label: 'Home', icon: 'home' },
    { tab: 'register', label: 'Register', icon: 'person_add' },
    { tab: 'school', label: 'School', icon: 'school' },
    { tab: 'reports', label: 'Reports', icon: 'assessment' },
    { tab: 'people', label: 'People', icon: 'people' },
    { tab: 'profile', label: 'Profile', icon: 'account_circle' }
  ],
  Teacher: [
    { tab: 'home', label: 'Home', icon: 'home' },
    { tab: 'attendance', label: 'Attendance', icon: 'check_circle' },
    { tab: 'people', label: 'People', icon: 'people' },
    { tab: 'events', label: 'Events', icon: 'event' },
    { tab: 'lost', label: 'Lost', icon: 'inventory_2' },
    { tab: 'release', label: 'Release', icon: 'send' },
    { tab: 'comms', label: 'Comms', icon: 'chat' }
  ],
  Parent: [
    { tab: 'home', label: 'Home', icon: 'home' },
    { tab: 'calendar', label: 'Calendar', icon: 'calendar_month' },
    { tab: 'messages', label: 'Messages', icon: 'chat' },
    { tab: 'lostFound', label: 'Lost', icon: 'inventory_2' },
    { tab: 'people', label: 'People', icon: 'people' },
    { tab: 'profile', label: 'Profile', icon: 'account_circle' }
  ],
  Guard: [
    { tab: 'home', label: 'Home', icon: 'home' },
    { tab: 'security', label: 'Security', icon: 'shield' }
  ],
  Nurse: [
    { tab: 'home', label: 'Home', icon: 'home' },
    { tab: 'clinic', label: 'Clinic', icon: 'local_hospital' }
  ]
};

function getRoleNavigation(role) {
  const normalizedRole = String(role || 'Admin').trim().toLowerCase();
  const selectedRole = Object.keys(roleNavigation).find((key) => key.toLowerCase() === normalizedRole);
  return roleNavigation[selectedRole || 'Admin'] || roleNavigation.Admin;
}

function getRoleProfile(role) {
  const normalizedRole = String(role || 'Admin').trim().toLowerCase();
  const selectedRole = Object.keys(roleProfiles).find((key) => key.toLowerCase() === normalizedRole);
  return roleProfiles[selectedRole || 'Admin'] || roleProfiles.Admin;
}

const roleTabs = {
  Admin: ['dashboard', 'people', 'safety', 'comms', 'reports'],
  Teacher: ['dashboard', 'people', 'safety', 'comms'],
  Parent: ['dashboard', 'comms'],
  Guard: ['dashboard', 'safety'],
  Nurse: ['dashboard', 'safety']
};

export { getRoleNavigation, getRoleProfile, roleProfiles, roleTabs };
