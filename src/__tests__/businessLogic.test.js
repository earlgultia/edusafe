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

  it('updates an existing attendance record for the same student on the same day with the latest status', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.students = [{ id: 's1', name: 'Child Test' }];
    state.school = { name: 'Sample School' };

    const setData = (updater) => {
      state = updater(state);
    };

    const actions = createAppActions(setData);

    actions.markAttendance('s1', 'Present');
    actions.markAttendance('s1', 'Late');

    const studentAttendance = state.attendanceLog.filter((entry) => entry.studentId === 's1');
    expect(studentAttendance).toHaveLength(1);
    expect(studentAttendance[0].status).toBe('Late');
    expect(state.students[0].status).toBe('Late');
  });

  it('blocks attendance changes for users without attendance permission and queues them offline', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.students = [{ id: 's1', name: 'Child Test' }];
    state.school = { name: 'Sample School' };

    const setData = (updater) => {
      state = updater(state);
    };

    const actions = createAppActions(setData, { role: 'parent' });
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });

    actions.markAttendance('s1', 'Present');

    expect(state.attendanceLog).toHaveLength(0);
    expect(state.offlineQueue).toHaveLength(1);
    expect(state.auditLog.some((entry) => entry.details?.reason === 'forbidden')).toBe(true);
  });

  it('blocks pickup releases for parents and queues them offline', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.students = [{ id: 's1', name: 'Child Test' }];
    state.guardians = [{ id: 'g1', studentId: 's1', name: 'Parent One', verified: true }];
    state.school = { name: 'Sample School' };

    const setData = (updater) => {
      state = updater(state);
    };

    const actions = createAppActions(setData, { role: 'parent' });
    actions.releaseStudent('g1');

    expect(state.pickupLog).toHaveLength(0);
    expect(state.offlineQueue).toHaveLength(1);
    expect(state.auditLog.some((entry) => entry.action === 'releaseStudent')).toBe(true);
  });

  it('blocks emergency triggers for unauthorized roles', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.school = { name: 'Sample School' };

    const setData = (updater) => {
      state = updater(state);
    };

    const actions = createAppActions(setData, { role: 'teacher' });
    actions.triggerEmergency('Lockdown', 'Secure the building');

    expect(state.emergency).toHaveLength(0);
    expect(state.offlineQueue).toHaveLength(1);
    expect(state.auditLog.some((entry) => entry.action === 'triggerEmergency')).toBe(true);
  });

  it('blocks visitor checkouts for unauthorized roles and queues the action offline', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.school = { name: 'Sample School' };
    state.visitors = [{ id: 'v1', name: 'Visitor One', status: 'On campus' }];

    const setData = (updater) => {
      state = updater(state);
    };

    const actions = createAppActions(setData, { role: 'parent' });
    actions.checkoutVisitor('v1');

    expect(state.visitors[0].status).toBe('On campus');
    expect(state.offlineQueue).toHaveLength(1);
    expect(state.auditLog.some((entry) => entry.action === 'checkoutVisitor')).toBe(true);
  });

  it('blocks incident reporting for users without incident permission', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.school = { name: 'Sample School' };

    const setData = (updater) => {
      state = updater(state);
    };

    const actions = createAppActions(setData, { role: 'parent' });
    actions.addIncident({ student: 'Child', type: 'Bullying' });

    expect(state.incidents).toHaveLength(0);
    expect(state.offlineQueue).toHaveLength(1);
    expect(state.auditLog.some((entry) => entry.action === 'addIncident')).toBe(true);
  });

  it('blocks repeated emergency triggers within the cooldown window', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.school = { name: 'Sample School' };
    state.emergency = [{ id: 'e1', type: 'Lockdown', createdAt: new Date().toISOString() }];

    const setData = (updater) => {
      state = updater(state);
    };

    const actions = createAppActions(setData, { role: 'admin' });
    actions.triggerEmergency('Lockdown', 'Secure the building');

    expect(state.emergency).toHaveLength(1);
    expect(state.offlineQueue).toHaveLength(1);
    expect(state.auditLog.some((entry) => entry.details?.reason === 'cooldown')).toBe(true);
  });

  it('escalates critical incidents to a pending review state', () => {
    let state = JSON.parse(JSON.stringify(initialData));
    state.school = { name: 'Sample School' };

    const setData = (updater) => {
      state = updater(state);
    };

    const actions = createAppActions(setData, { role: 'admin' });
    actions.addIncident({ student: 'Child', type: 'Violence', severity: 'Critical', description: 'A high-risk safety event requires review.' });

    expect(state.incidents[0].status).toBe('Pending Review');
    expect(state.notifications.some((notification) => notification.type === 'incident')).toBe(true);
  });
});
