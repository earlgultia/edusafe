import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { VisitorForm } from '../components/forms/VisitorForm.jsx';

describe('workflow validation', () => {
  it('prevents empty visitor submissions', () => {
    const close = vi.fn();
    const actions = { addVisitor: vi.fn() };

    render(<VisitorForm close={close} actions={actions} />);

    fireEvent.click(screen.getByRole('button', { name: /generate qr pass/i }));

    expect(actions.addVisitor).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });
});
