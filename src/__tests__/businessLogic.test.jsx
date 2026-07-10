import { describe, it, expect } from 'vitest';
import { initialData } from '../data/initialData.js';
import { createAppActions } from '../app/appActions.js';

describe('phase 1 business logic', () => {
  it('prevents duplicate attendance entries for the same student on the same day and records an audit entry', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.students = [{ id: 's1', name: 'Child Test' }];
    state.school = { name: 'Sample School' };

    const setData = (updater) => {
      state = updater(state);
    };

    const actions = createAppActions(setData);

    actions.markAttendance('s1', 'Present');
    actions.markAttendance('s1', 'Present');

    const studentAttendance = state.attendanceLog.filter((entry) => entry.studentId === 's1');
    expect(studentAttendance).toHaveLength(1);
    expect(state.auditLog.some((entry) => entry.action === 'markAttendance')).toBe(true);
  });
});
