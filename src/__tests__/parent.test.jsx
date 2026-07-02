import { describe, it, expect } from 'vitest';
import { initialData } from '../../src/data/initialData.js';
import { createAppActions } from '../../src/app/appActions.js';

describe('Parent flows via appActions', () => {
  it('adds event, clinic, incident, guardian, attendance and release', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.students = [{ id: 's1', name: 'Child Test' }];
    state.forms = [{ id: 'f1', total: 4, submitted: 2 }];

    const setData = (updater) => { state = updater(state); };
    const actions = createAppActions(setData);

    actions.addEvent({ title: 'Test', date: '2026-07-20' });
    expect(state.events.length).toBe(1);

    actions.addClinic({ student: 'Child Test', reason: 'Fever' });
    expect(state.clinic.length).toBe(1);

    actions.addIncident({ type: 'Slip', student: 'Child Test', description: 'Playground' });
    expect(state.incidents.length).toBe(1);

    actions.addGuardian({ name: 'Parent A', studentId: 's1' });
    expect(state.guardians.length).toBe(1);

    // mark guardian verified for release flow
    state.guardians[0].verified = true;

    actions.markAttendance('s1', 'Present');
    expect(state.attendanceLog.length).toBeGreaterThan(0);

    actions.releaseStudent(state.guardians[0].id);
    expect((state.pickupLog || []).length).toBeGreaterThan(0);
    expect(state.students.find((s) => s.id === 's1').release).toBe('Released');
  });
});
