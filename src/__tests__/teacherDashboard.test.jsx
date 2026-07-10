import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { RoleDashboard } from '../pages/dashboards/RoleDashboard.jsx';
import { createAppActions } from '../app/appActions.js';

describe('Teacher dashboard', () => {
  it('shows only students matching the teacher grade and section in attendance preview', () => {
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
});
