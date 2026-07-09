import { describe, it, expect } from 'vitest';
import { initialData } from '../data/initialData.js';
import { createAppActions } from '../app/appActions.js';

describe('Removal cascade', () => {
  it('removing a student cascades to teacher views and guardians', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.students = [{ id: 's1', name: 'Cascade Student', grade: '3', section: 'A' }];
    state.teachers = [{ id: 't1', name: 'Teacher 1', advisory: '3A', grade: '3', section: 'A' }];
    state.guardians = [{ id: 'g1', name: 'Parent 1', studentId: 's1' }];

    const setData = (updater) => { state = updater(state); };
    const actions = createAppActions(setData);

    actions.removeStudent('s1');

    expect(state.students.find((s) => s.id === 's1')).toBeUndefined();
    expect(state.guardians.find((g) => g.studentId === 's1')).toBeUndefined();
  });

  it('removing a teacher cascades to teacher roster', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.teachers = [{ id: 't1', name: 'Teacher To Remove', advisory: '3A', grade: '3', section: 'A' }];
    state.students = [{ id: 's1', name: 'Student A', grade: '3', section: 'A' }];

    const setData = (updater) => { state = updater(state); };
    const actions = createAppActions(setData);

    actions.removeTeacher('t1');

    expect(state.teachers.find((t) => t.id === 't1')).toBeUndefined();
  });

  it('removing a guardian cascades to release queue and guardian lists', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.guardians = [{ id: 'g1', name: 'Removable Parent', studentId: 's1', qr: 'G1' }];
    state.students = [{ id: 's1', name: 'Student A' }];

    const setData = (updater) => { state = updater(state); };
    const actions = createAppActions(setData);

    actions.removeGuardian('g1');

    expect(state.guardians.find((g) => g.id === 'g1')).toBeUndefined();
  });
});
