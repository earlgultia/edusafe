const today = new Date().toLocaleDateString('en-PH', {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
});

const initialData = {
  school: {
    name: 'EduSafe PH Academy',
    id: 'ESP-2026-001',
    type: 'Integrated School',
    address: 'Mandaluyong City, Metro Manila',
    contact: '+63 917 555 0148',
    year: '2026-2027'
  },
  teachers: [
    { id: 1, name: 'Ana Reyes', employeeNo: 'T-1001', position: 'Grade Adviser', advisory: 'Grade 1 - A', phone: '+63 917 112 4822' },
    { id: 2, name: 'Marco Dizon', employeeNo: 'T-1002', position: 'Science Teacher', advisory: 'Grade 7 - B', phone: '+63 918 904 7171' }
  ],
  students: [
    { id: 1, lrn: '136502010001', name: 'John Santos', grade: 'Grade 1', section: 'A', gender: 'Male', blood: 'O+', guardian: 'Maria Santos', status: 'Present', release: 'Waiting', medical: 'Asthma' },
    { id: 2, lrn: '136502010002', name: 'Lia Cruz', grade: 'Grade 1', section: 'A', gender: 'Female', blood: 'A+', guardian: 'Ramon Cruz', status: 'Late', release: 'Released', medical: 'None' },
    { id: 3, lrn: '136502070020', name: 'Paolo Garcia', grade: 'Grade 7', section: 'B', gender: 'Male', blood: 'B+', guardian: 'Elena Garcia', status: 'Absent', release: 'N/A', medical: 'Peanut allergy' }
  ],
  guardians: [
    { id: 1, name: 'Maria Santos', relation: 'Mother', phone: '+63 917 800 1200', studentId: 1, verified: true, qr: 'GDN-JOHN-MARIA' },
    { id: 2, name: 'Ramon Cruz', relation: 'Father', phone: '+63 917 840 3310', studentId: 2, verified: true, qr: 'GDN-LIA-RAMON' },
    { id: 3, name: 'School Service A', relation: 'Driver', phone: '+63 918 100 4432', studentId: 1, verified: false, qr: 'GDN-JOHN-SERVICE' }
  ],
  visitors: [
    { id: 1, name: 'Nina Valdez', purpose: 'Parent meeting', person: 'Ana Reyes', status: 'On campus', timeIn: '9:12 AM', timeOut: '' }
  ],
  visitorLog: [
    { id: 1, name: 'Nina Valdez', purpose: 'Parent meeting', person: 'Ana Reyes', status: 'Checked in', timeIn: '9:12 AM', timeOut: '' },
    { id: 2, name: 'Carlos Dela Cruz', purpose: 'Document submission', person: 'Office', status: 'Checked out', timeIn: '8:40 AM', timeOut: '9:05 AM' }
  ],
  incidents: [
    { id: 1, type: 'Injury', student: 'Lia Cruz', description: 'Minor scrape during PE. Cleaned and monitored.', status: 'Notified' }
  ],
  clinic: [
    { id: 1, student: 'John Santos', reason: 'Cough', temp: '37.3 C', treatment: 'Rest, water, parent notified', medicine: 'None' }
  ],
  announcements: [
    { id: 1, title: 'PTA Meeting', audience: 'All Parents', body: 'PTA meeting will be held Friday at 3:00 PM.', priority: 'Normal' },
    { id: 2, title: 'Class Suspension Drill', audience: 'All', body: 'Safety drill scheduled after flag ceremony.', priority: 'High' }
  ],
  attendanceLog: [
    { id: 1, studentId: 1, student: 'John Santos', status: 'Present', time: '7:32 AM', date: 'Today' },
    { id: 2, studentId: 2, student: 'Lia Cruz', status: 'Late', time: '7:45 AM', date: 'Today' }
  ],
  pickupLog: [
    { id: 1, studentId: 2, student: 'Lia Cruz', guardian: 'Ramon Cruz', status: 'Released', time: '3:18 PM', date: 'Today' }
  ],
  forms: [
    { id: 1, title: 'Field Trip Consent', audience: 'Grade 1 - A', status: 'Pending', submitted: 18, total: 24 },
    { id: 2, title: 'Medical Update Form', audience: 'All Parents', status: 'Open', submitted: 112, total: 320 }
  ],
  lostFound: [
    { id: 1, item: 'Blue lunch bag', location: 'Canteen', date: 'Jun 30', status: 'Unclaimed' }
  ],
  emergency: [
    { id: 1, type: 'Fire', time: '9:25 AM', status: 'Broadcast sent' }
  ]
};

const mvpScreens = [
  { title: 'School Setup', role: 'Admin', description: 'Create the school profile, school year, grade levels, and sections before daily use.' },
  { title: 'People Registry', role: 'Admin / Teacher', description: 'Register teachers, students, parents, and trusted guardians with QR links.' },
  { title: 'Attendance', role: 'Teacher', description: 'Mark present, absent, late, or excused and notify parents instantly.' },
  { title: 'Guardian Pickup', role: 'Teacher / Guard', description: 'Scan guardian QR codes and release students only to approved adults.' },
  { title: 'Visitor Control', role: 'Guard', description: 'Log visitors, capture identity, generate passes, and record checkout.' },
  { title: 'Alerts & Reports', role: 'Admin', description: 'Send announcements or emergency alerts and export school reports.' }
];

const coreModel = [
  { entity: 'School', purpose: 'Owns the setup profile, school year, grade levels, and sections.' },
  { entity: 'User', purpose: 'Stores login identity and role for admin, teacher, parent, guard, and nurse.' },
  { entity: 'Student', purpose: 'Keeps LRN, class assignment, medical notes, and parent links.' },
  { entity: 'Guardian', purpose: 'Tracks trusted adult data, verification status, and QR code ownership.' },
  { entity: 'Attendance', purpose: 'Records present, absent, late, and excused status by date.' },
  { entity: 'Pickup', purpose: 'Logs QR verification, release status, and pickup history.' },
  { entity: 'Visitor', purpose: 'Stores visitor identity, purpose, pass status, and check-out time.' },
  { entity: 'Incident', purpose: 'Captures incident type, involved students, description, and media.' },
  { entity: 'ClinicRecord', purpose: 'Keeps clinic visits, temperature, medicine, and treatment notes.' },
  { entity: 'Announcement', purpose: 'Delivers school notices, audience targeting, and priority level.' },
  { entity: 'Notification', purpose: 'Pushes system updates tied to attendance, pickup, alerts, and forms.' }
];

const landingProof = [
  { value: '1 app', label: 'for attendance, pickup, visitors, and alerts' },
  { value: '5 roles', label: 'admin, teacher, parent, guard, and nurse' },
  { value: '24/7', label: 'cloud-synced safety records and notifications' }
];

const landingStats = [
  { value: 'Fast setup', label: 'Launch the school profile and invite staff in minutes' },
  { value: 'Mobile first', label: 'Designed for daily use on phones and tablets' },
  { value: 'Safe by default', label: 'Role-based access for every school workflow' }
];

const landingFeatures = [
  { title: 'Attendance in seconds', text: 'Mark present, absent, late, or excused with instant parent notifications.' },
  { title: 'Verified pickup flow', text: 'Release students only after trusted guardian QR verification.' },
  { title: 'Visitor and emergency control', text: 'Manage campus entry and broadcast urgent alerts from one mobile flow.' }
];

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

export {
  today,
  initialData,
  mvpScreens,
  coreModel,
  landingProof,
  landingStats,
  landingFeatures,
  roleProfiles,
  roleTabs
} from './data/index.js';
