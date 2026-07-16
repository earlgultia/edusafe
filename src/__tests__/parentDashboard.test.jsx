import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ParentDashboard } from '../pages/dashboards/ParentDashboard.jsx';

describe('Parent dashboard', () => {
  it('blocks claim submission until the parent provides contact details', async () => {
    render(
      <ParentDashboard
        data={{
          students: [{ id: 's1', name: 'Ana Cruz' }],
          lostFound: [{ id: 'item1', item: 'Water bottle', location: 'Gym', date: 'Today', status: 'Found' }]
        }}
        userName="Parent One"
        auth={{}} 
        setAuth={vi.fn()}
        setSheet={vi.fn()}
        actions={{ claimLostItem: vi.fn() }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /lost & found/i }));
    fireEvent.click(screen.getByRole('button', { name: /^claim$/i }));
    fireEvent.click(screen.getByRole('button', { name: /submit claim/i }));

    expect(screen.getByText(/please add a phone number or email/i)).toBeInTheDocument();
  });

  it('exposes the lost and found tab from the bottom navigation and supports claiming an item', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    const actions = { claimLostItem: vi.fn() };

    render(
      <ParentDashboard
        data={{
          students: [{ id: 's1', name: 'Ana Cruz' }],
          lostFound: [{ id: 'item1', item: 'Water bottle', location: 'Gym', date: 'Today', status: 'Found' }]
        }}
        userName="Parent One"
        auth={{}} 
        setAuth={vi.fn()}
        setSheet={vi.fn()}
        actions={actions}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /lost & found/i }));
    expect(screen.getByRole('heading', { name: /Lost & Found/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /claim/i }));
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Parent One' } });
    fireEvent.change(screen.getByLabelText(/contact/i), { target: { value: '0917-111-2222' } });
    fireEvent.click(screen.getByRole('button', { name: /submit claim/i }));

    expect(actions.claimLostItem).toHaveBeenCalledWith('item1', 'Parent One', '0917-111-2222');
  });

  it('shows only guardian-linked students for a parent account', () => {
    const actions = {};

    render(
      <ParentDashboard
        data={{
          students: [
            { id: 's1', name: 'Ana Cruz' },
            { id: 's2', name: 'Ben Santos' }
          ],
          guardians: [
            { id: 'g1', name: 'Parent One', email: 'parent1@example.com', studentId: 's2' }
          ]
        }}
        userName="Parent One"
        auth={{ email: 'parent1@example.com', fullName: 'Parent One' }}
        setAuth={vi.fn()}
        setSheet={vi.fn()}
        actions={actions}
      />
    );

    const select = screen.getByRole('combobox', { name: /switch child profile/i }) || screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select.querySelectorAll('option').length).toBe(1);
    expect(screen.getByRole('heading', { name: 'Ben Santos' })).toBeInTheDocument();
  });

  it('does not show students that are not linked to the parent account', () => {
    const actions = {};

    render(
      <ParentDashboard
        data={{
          students: [
            { id: 's1', name: 'Ana Cruz' },
            { id: 's2', name: 'Ben Santos' }
          ],
          guardians: [{ id: 'g1', name: 'Parent One', email: 'other@example.com', studentId: 's3' }]
        }}
        userName="Parent One"
        auth={{ email: 'parent1@example.com', fullName: 'Parent One' }}
        setAuth={vi.fn()}
        setSheet={vi.fn()}
        actions={actions}
      />
    );

    expect(screen.queryByText('Ana Cruz')).not.toBeInTheDocument();
    expect(screen.queryByText('Ben Santos')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /switch child profile/i })).not.toBeInTheDocument();
    expect(screen.getByText('Linked child')).toBeInTheDocument();
  });

  it('shows students linked through parent identifiers stored on the student record', () => {
    render(
      <ParentDashboard
        data={{
          students: [{ id: 's1', name: 'Ana Cruz', parentId: 'p-123' }],
          guardians: []
        }}
        userName="Parent One"
        auth={{ id: 'p-123', fullName: 'Parent One' }}
        setAuth={vi.fn()}
        setSheet={vi.fn()}
        actions={{}}
      />
    );

    expect(screen.getByRole('combobox', { name: /switch child profile/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ana Cruz' })).toBeInTheDocument();
  });

  it('shows students linked by guardian phone when no email is present', () => {
    render(
      <ParentDashboard
        data={{
          students: [{ id: 's1', name: 'Ana Cruz' }],
          guardians: [{ id: 'g1', studentId: 's1', phone: '09170000000' }]
        }}
        userName="Parent One"
        auth={{ phone: '09170000000' }}
        setAuth={vi.fn()}
        setSheet={vi.fn()}
        actions={{}}
      />
    );

    expect(screen.getByRole('combobox', { name: /switch child profile/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ana Cruz' })).toBeInTheDocument();
  });

  it('does not show a child whose student record has been removed', () => {
    const actions = {};

    render(
      <ParentDashboard
        data={{
          students: [{ id: 's1', name: 'Ana Cruz' }],
          guardians: [{ id: 'g1', name: 'Parent One', email: 'parent1@example.com', studentId: 's2' }]
        }}
        userName="Parent One"
        auth={{ email: 'parent1@example.com', fullName: 'Parent One' }}
        setAuth={vi.fn()}
        setSheet={vi.fn()}
        actions={actions}
      />
    );

    expect(screen.queryByText('Ben Santos')).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Ben Santos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /switch child profile/i })).not.toBeInTheDocument();
    expect(screen.getByText('Linked child')).toBeInTheDocument();
  });

  it('shows attendance records when the teacher stored the student id in a different format', () => {
    render(
      <ParentDashboard
        data={{
          students: [{ id: 's1', name: 'Ana Cruz' }],
          guardians: [{ id: 'g1', name: 'Parent One', email: 'parent1@example.com', studentId: 's1' }],
          attendanceLog: [{ id: 'a1', studentId: 1, student: 'Ana Cruz', status: 'Present', date: 'Today' }]
        }}
        userName="Parent One"
        auth={{ email: 'parent1@example.com', fullName: 'Parent One' }}
        setAuth={vi.fn()}
        setSheet={vi.fn()}
        actions={{}}
      />
    );

    expect(screen.getByText(/1 attendance records/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Present/i).length).toBeGreaterThan(0);
  });

  it('does not link a student to another parent account when the names do not match', () => {
    render(
      <ParentDashboard
        data={{
          students: [
            { id: 's1', name: 'Ana Cruz' },
            { id: 's2', name: 'Ben Santos' }
          ],
          guardians: [
            { id: 'g1', name: 'Parent One', email: 'other@example.com', studentId: 's2' }
          ]
        }}
        userName="Parent One"
        auth={{ email: 'parent1@example.com', fullName: 'Parent Two' }}
        setAuth={vi.fn()}
        setSheet={vi.fn()}
        actions={{}}
      />
    );

    expect(screen.queryByText('Ben Santos')).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Ben Santos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /switch child profile/i })).not.toBeInTheDocument();
    expect(screen.getByText('Linked child')).toBeInTheDocument();
  });

  it('shows only real emergency alerts in the parent dashboard alert section', () => {
    render(
      <ParentDashboard
        data={{
          students: [{ id: 's1', name: 'Ana Cruz' }],
          guardians: [{ id: 'g1', studentId: 's1', email: 'parent1@example.com' }],
          emergency: [{ id: 'e1', title: 'Weather Alert', message: 'Classes will resume at 10 AM.', time: '8:00 AM' }],
          auditLog: [
            { id: 'a1', action: 'markAttendance', details: { reason: 'duplicate_attendance' }, timestamp: '2026-07-15T16:15:42.000Z' },
            { id: 'a2', action: 'unlinkStudentFromParent', details: { reason: 'Record updated' }, timestamp: '2026-07-15T16:15:21.000Z' }
          ]
        }}
        userName="Parent One"
        auth={{ email: 'parent1@example.com', fullName: 'Parent One' }}
        setAuth={vi.fn()}
        setSheet={vi.fn()}
        actions={{}}
      />
    );

    expect(screen.getByText('Weather Alert')).toBeInTheDocument();
    expect(screen.queryByText('markAttendance')).not.toBeInTheDocument();
    expect(screen.queryByText('unlinkStudentFromParent')).not.toBeInTheDocument();
  });

  it('allows a parent to remove a linked student from their dashboard', () => {
    const unlinkStudentFromParent = vi.fn();
    window.confirm = vi.fn(() => true);

    render(
      <ParentDashboard
        data={{
          students: [{ id: 's1', name: 'Ana Cruz' }],
          guardians: [{ id: 'g1', studentId: 's1', email: 'parent1@example.com' }]
        }}
        userName="Parent One"
        auth={{ email: 'parent1@example.com', fullName: 'Parent One' }}
        setAuth={vi.fn()}
        setSheet={vi.fn()}
        actions={{ unlinkStudentFromParent }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /remove linked student/i }));

    expect(unlinkStudentFromParent).toHaveBeenCalledWith('s1', expect.objectContaining({ email: 'parent1@example.com' }));
  });
});
