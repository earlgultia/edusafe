import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ParentDashboard } from '../pages/dashboards/ParentDashboard.jsx';

describe('Parent dashboard', () => {
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
    expect(screen.getByText(/Lost & Found/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /claim/i }));
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Parent One' } });
    fireEvent.change(screen.getByLabelText(/contact/i), { target: { value: '0917-111-2222' } });
    fireEvent.click(screen.getByRole('button', { name: /submit claim/i }));

    expect(actions.claimLostItem).toHaveBeenCalledWith('item1', 'Parent One', '0917-111-2222');
  });
});
