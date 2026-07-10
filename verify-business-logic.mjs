import { createAppActions } from './src/app/appActions.js';

let state = {
  school: { name: 'Sample' },
  attendanceLog: [],
  announcements: [],
  notifications: [],
  students: [{ id: 's1', name: 'Child' }],
  guardians: [],
  auditLog: []
};

const setData = (updater) => {
  state = updater(state);
};

const actions = createAppActions(setData);
actions.markAttendance('s1', 'Present');
actions.markAttendance('s1', 'Present');

console.log(JSON.stringify({ attendance: state.attendanceLog.length, audit: state.auditLog.length }, null, 2));
