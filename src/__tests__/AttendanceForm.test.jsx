import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AttendanceForm } from '../components/forms/AttendanceForm.jsx';

describe('AttendanceForm', () => {
  it('highlights the newly selected attendance status immediately', () => {
    const markAttendance = vi.fn();

    render(
      <AttendanceForm
        close={() => {}}
        actions={{ markAttendance }}
        data={{ students: [{ id: 's1', name: 'Student One', grade: '3', section: 'A', status: 'Present' }] }}
      />
    );

    const presentButton = screen.getByRole('button', { name: 'Present' });
    const absentButton = screen.getByRole('button', { name: 'Absent' });

    expect(presentButton).toHaveClass('selected');
    expect(absentButton).not.toHaveClass('selected');

    fireEvent.click(absentButton);

    expect(markAttendance).toHaveBeenCalledWith('s1', 'Absent');
    expect(absentButton).toHaveClass('selected');
    expect(presentButton).not.toHaveClass('selected');
  });
});
