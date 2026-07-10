import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { SignedInView } from './SignedInView.jsx';

vi.mock('./AppChrome.jsx', () => ({ AppChrome: () => <div /> }));
vi.mock('../components/ActionSheet.jsx', () => ({ ActionSheet: () => null }));
vi.mock('../components/LogoutSweetAlert.jsx', () => ({ LogoutSweetAlert: () => null }));

vi.mock('../pages/dashboards/RoleDashboard.jsx', () => ({
  RoleDashboard: ({ data }) => (
    <div>
      {(data?.students || []).map((student) => (
        <span key={student.id}>{student.name}</span>
      ))}
    </div>
  )
}));

describe('SignedInView', () => {
  it('passes only teacher-scoped students to the teacher dashboard', () => {
    render(
      <SignedInView
        role="Teacher"
        userName="Teacher A"
        auth={{ email: 'teacher.a@school.edu.ph', fullName: 'Teacher A' }}
        setAuth={vi.fn()}
        signOut={vi.fn()}
        data={{
          students: [
            { id: 's1', name: 'Student One', grade: '3', section: 'B' },
            { id: 's2', name: 'Student Two', grade: '4', section: 'B' }
          ],
          teachers: [{ id: 't1', name: 'Teacher A', email: 'teacher.a@school.edu.ph', grade: '3', section: 'B' }],
          guardians: []
        }}
        stats={{}}
        actions={{}}
        sheet={null}
        setSheet={vi.fn()}
      />
    );

    expect(screen.getByText('Student One')).toBeInTheDocument();
    expect(screen.queryByText('Student Two')).not.toBeInTheDocument();
  });
});
