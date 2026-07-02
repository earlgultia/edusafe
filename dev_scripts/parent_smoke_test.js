import { initialData } from '../src/data/initialData.js';
import { createAppActions } from '../src/app/appActions.js';

let state = JSON.parse(JSON.stringify(initialData));
state.students = [{ id: 's1', name: 'Child One' }, { id: 's2', name: 'Child Two' }];
state.guardians = [];
state.forms = [{ id: 'f1', total: 10, submitted: 6 }];

const setData = (updater) => { state = updater(state); };
const actions = createAppActions(setData);

console.log('Initial summary:', {
  students: state.students.length,
  events: state.events.length,
  clinic: state.clinic.length,
  incidents: state.incidents.length,
  guardians: state.guardians.length,
  formsPending: state.forms.reduce((s,f)=>s+Math.max(f.total-f.submitted,0),0)
});

// Add event
actions.addEvent({ title: 'Sports Day', date: '2026-07-10', location: 'Main Field', details: 'All students participate' });
// Add clinic visit
actions.addClinic({ student: 'Child One', reason: 'Headache', temp: '37.5' });
// Add incident
actions.addIncident({ type: 'Fall', student: 'Child One', description: 'Slipped during play' });
// Add guardian
actions.addGuardian({ name: 'Parent One', studentId: 's1' });
// Mark attendance
actions.markAttendance('s1', 'Present');
actions.markAttendance('s2', 'Absent');
// Release guardian (mark verified first by directly mutating for test)
state.guardians = state.guardians.map(g => ({ ...g, verified: true }));
// Release (should update students release status)
if (state.guardians[0]) actions.releaseStudent(state.guardians[0].id);

console.log('Post-actions summary:', {
  students: state.students.map(s => ({ id: s.id, name: s.name, status: s.status, release: s.release })),
  events: state.events.slice(0,3),
  clinic: state.clinic.slice(0,3),
  incidents: state.incidents.slice(0,3),
  guardians: state.guardians,
  pickupLog: state.pickupLog || [],
  attendanceLog: state.attendanceLog.slice(0,5) || []
});

// Simulate parent view filters
const selectedStudentId = 's1';
const studentAttendance = (state.attendanceLog || []).filter(e => e.studentId === selectedStudentId);
const pickupHistory = (state.pickupLog || []).filter(e => e.studentId === selectedStudentId);
console.log('Parent view for s1:', { attendanceCount: studentAttendance.length, pickupCount: pickupHistory.length });

console.log('Smoke test complete.');
