import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { PeopleSheet } from '../components/PeopleSheet.jsx';

describe('PeopleSheet', () => {
  it('hides student delete actions when the view is scoped to a parent-linked student', () => {
    const removeStudent = vi.fn();

    render(
      <PeopleSheet
        data={{
          students: [{ id: 's1', name: 'Student One', grade: '3', section: 'A', status: 'Active' }],
          teachers: [],
          guardians: []
        }}
        actions={{ removeStudent }}
        hideStudentDelete
      />
    );

    expect(screen.getByText('Student One')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });
});
