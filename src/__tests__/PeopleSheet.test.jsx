import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { PeopleSheet } from '../components/PeopleSheet.jsx';

describe('PeopleSheet', () => {
  it('shows a remove action for parent-linked students and uses the unlink action', () => {
    const unlinkStudentFromParent = vi.fn();
    window.confirm = vi.fn(() => true);

    render(
      <PeopleSheet
        data={{
          students: [{ id: 's1', name: 'Student One', grade: '3', section: 'A', status: 'Active' }],
          teachers: [],
          guardians: []
        }}
        actions={{ unlinkStudentFromParent }}
        parentAuth={{ email: 'parent@example.com' }}
        hideStudentDelete
      />
    );

    expect(screen.getByText('Student One')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(unlinkStudentFromParent).toHaveBeenCalledWith('s1', { email: 'parent@example.com' });
  });
});
