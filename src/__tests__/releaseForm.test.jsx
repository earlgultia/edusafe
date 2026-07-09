import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ReleaseForm } from '../components/forms/ReleaseForm.jsx';

describe('ReleaseForm', () => {
  it('offers a remove action for guardian verifications', () => {
    const close = vi.fn();
    const removeGuardian = vi.fn();
    window.confirm = vi.fn(() => true);

    render(
      <ReleaseForm
        close={close}
        actions={{ releaseStudent: vi.fn(), removeGuardian }}
        data={{
          guardians: [{ id: 'g1', name: 'Maria Santos', relation: 'Mother', verified: true, qr: 'GDN-001' }],
          students: [{ id: 's1', name: 'Ana Santos' }]
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));

    expect(removeGuardian).toHaveBeenCalledWith('g1');
    expect(close).not.toHaveBeenCalled();
  });
});
