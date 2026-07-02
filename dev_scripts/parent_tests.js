import { initialData } from '../src/data/initialData.js';
import { createAppActions } from '../src/app/appActions.js';

let state = JSON.parse(JSON.stringify(initialData));
const setData = (updater) => { state = updater(state); };
const actions = createAppActions(setData);

function assert(cond, msg) { if (!cond) { console.error('ASSERT FAILED:', msg); process.exit(2); } }

// seed
state.students = [{ id: 's1', name: 'Test Child' }];
state.forms = [{ id: 'f1', total: 5, submitted: 3 }];

// Add event
actions.addEvent({ title: 'Test Event', date: '2026-07-15' });
assert(state.events.length === 1, 'Event should be added');

// Add clinic
actions.addClinic({ student: 'Test Child', reason: 'Sore throat' });
assert(state.clinic.length === 1, 'Clinic record should be added');

// Add incident
actions.addIncident({ type: 'Bump', student: 'Test Child', description: 'Minor bump' });
assert(state.incidents.length === 1, 'Incident should be added');

// Add guardian and verify
actions.addGuardian({ name: 'Parent', studentId: 's1' });
assert(state.guardians.length === 1, 'Guardian added');
state.guardians[0].verified = true;

// Mark attendance
actions.markAttendance('s1', 'Present');
assert(state.attendanceLog.length === 1, 'Attendance recorded');

// Release student via guardian
actions.releaseStudent(state.guardians[0].id);
assert((state.pickupLog || []).length === 1, 'Pickup log should have an entry');
assert(state.students.find(s => s.id === 's1').release === 'Released', 'Student should be released');

console.log('All parent tests passed.');
