import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { RoleDashboard } from '../pages/dashboards/RoleDashboard.jsx';
import { createAppActions } from '../app/appActions.js';

describe('Teacher dashboard', () => {
  it('shows only students matching the teacher grade and section in attendance preview', async () => {
    const setSheet = vi.fn();
    const data = {
      teachers: [{ id: 't1', name: 'Teacher A', email: 'teacher.a@school.edu.ph', grade: '3', section: 'B' }],
      students: [
        { id: 's1', name: 'Student 1', grade: '3', section: 'B', status: 'Present' },
        { id: 's2', name: 'Student 2', grade: '3', section: 'A', status: 'Absent' },
        { id: 's3', name: 'Student 3', grade: '4', section: 'B', status: 'Late' }
      ],
      announcements: [],
      incidents: [],
      forms: [],
      events: []
    };

    render(
      <RoleDashboard
        role="Teacher"
        data={data}
        userName="Teacher A"
        auth={{ signedIn: true, role: 'Teacher', fullName: 'Teacher A', email: 'teacher.a@school.edu.ph' }}
        setSheet={setSheet}
        actions={{ addTeacher: vi.fn() }}
      />
    );

    expect(screen.getByRole('heading', { level: 2, name: /Attendance/i })).toBeInTheDocument();
    expect(screen.getByText('Student 1')).toBeInTheDocument();
    expect(screen.queryByText('Student 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Student 3')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /home/i }));
    expect(await screen.findByRole('button', { name: /report incident/i })).toBeInTheDocument();
  });

  it('links a newly added student to a teacher in the same grade and section', () => {
    let data = {
      teachers: [{ id: 't1', name: 'Teacher A', grade: '3', section: 'B' }],
      students: []
    };

    const setData = vi.fn((updater) => {
      data = updater(data);
    });

    const actions = createAppActions(setData);
    actions.addStudent({ lrn: '1001', name: 'Student 1', grade: '3', section: 'B' });

    expect(data.students[0].teacherId).toBe('t1');
  });

  it('keeps event creation on the admin dashboard instead of the teacher dashboard', () => {
    const setSheet = vi.fn();
    const teacherData = {
      teachers: [{ id: 't1', name: 'Teacher A', email: 'teacher.a@school.edu.ph', grade: '3', section: 'B' }],
      students: [],
      announcements: [],
      incidents: [],
      forms: [],
      events: []
    };

    const { rerender } = render(
      <RoleDashboard
        role="Teacher"
        data={teacherData}
        userName="Teacher A"
        auth={{ signedIn: true, role: 'Teacher', fullName: 'Teacher A', email: 'teacher.a@school.edu.ph' }}
        setSheet={setSheet}
        actions={{ addTeacher: vi.fn() }}
      />
    );

    expect(screen.queryByRole('button', { name: /add event/i })).not.toBeInTheDocument();

    rerender(
      <RoleDashboard
        role="Admin"
        data={{ students: [], teachers: [], guardians: [], announcements: [], incidents: [], forms: [], events: [] }}
        userName="Admin"
        auth={{ signedIn: true, role: 'Admin', fullName: 'Admin', email: 'admin@school.edu.ph' }}
        setSheet={setSheet}
        actions={{ addAnnouncement: vi.fn(), addTeacher: vi.fn(), removeIncident: vi.fn() }}
      />
    );

    expect(screen.getByRole('button', { name: /add event/i })).toBeInTheDocument();
  });

  it('stores selected guardians for teacher incident reports', () => {
    let data = {
      students: [{ id: 's1', name: 'Student 1', grade: '3', section: 'B' }],
      guardians: [{ id: 'g1', name: 'Parent One', relation: 'Mother', studentId: 's1' }],
      teachers: [],
      incidents: [],
      notifications: []
    };

    const setData = vi.fn((updater) => {
      data = updater(data);
    });

    const actions = createAppActions(setData);
    actions.addIncident({ type: 'Bullying', student: 'Student 1', studentId: 's1', description: 'Test', guardianIds: ['g1'] });

    expect(data.incidents[0].guardianIds).toEqual(['g1']);
    expect(data.notifications[0].guardianIds).toEqual(['g1']);
  });
});
