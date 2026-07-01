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

export { initialData };
