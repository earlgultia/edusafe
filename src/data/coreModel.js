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

export { coreModel };
