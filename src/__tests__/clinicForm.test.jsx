import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ClinicForm } from '../components/forms/ClinicForm.jsx';

describe('ClinicForm', () => {
  it('renders and submits even when no student data is present', () => {
    const close = vi.fn();
    const actions = { addClinic: vi.fn() };

    render(<ClinicForm close={close} actions={actions} data={{}} />);

    fireEvent.change(screen.getByLabelText('Student'), { target: { value: 'Ana Cruz' } });
    fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Fever' } });
    fireEvent.change(screen.getByLabelText('Temperature'), { target: { value: '38.5' } });
    fireEvent.change(screen.getByLabelText('Medicine'), { target: { value: 'Paracetamol' } });
    fireEvent.change(screen.getByLabelText('Treatment'), { target: { value: 'Rest and monitor' } });
    fireEvent.click(screen.getByRole('button', { name: /save clinic record/i }));

    expect(actions.addClinic).toHaveBeenCalledWith(expect.objectContaining({
      student: 'Ana Cruz',
      reason: 'Fever',
      temp: '38.5',
      medicine: 'Paracetamol',
      treatment: 'Rest and monitor'
    }));
    expect(close).toHaveBeenCalled();
  });
});
