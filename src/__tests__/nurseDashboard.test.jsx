import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { RoleDashboard } from '../pages/dashboards/RoleDashboard.jsx';

describe('Nurse dashboard', () => {
  it('renders the home view, switches to clinic records, and opens the clinic sheet', () => {
    const setSheet = vi.fn();
    const data = {
      clinic: [{ id: 'c1', student: 'Ana Cruz', reason: 'Fever', temp: '38.5' }],
      incidents: [{ id: 'i1', type: 'Minor cut', description: 'Bandaged' }],
      students: [{ id: 's1', name: 'Ana Cruz' }]
    };

    render(<RoleDashboard role="Nurse" data={data} userName="Nurse Jane" setSheet={setSheet} />);

    expect(screen.getByText(/Nurse workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Clinic visits/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clinic/i }));
    expect(screen.getByText(/Clinic records/i)).toBeInTheDocument();
    expect(screen.getByText('Ana Cruz')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /new record/i }));
    expect(setSheet).toHaveBeenCalledWith('clinic');
  });
});
