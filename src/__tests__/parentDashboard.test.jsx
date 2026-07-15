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

  it('does not link a student to another parent account when only the guardian name matches', () => {
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
        auth={{ email: 'parent1@example.com', fullName: 'Parent One' }}
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
});
