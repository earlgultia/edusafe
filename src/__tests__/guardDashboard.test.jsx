import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { RoleDashboard } from '../pages/dashboards/RoleDashboard.jsx';

describe('Guard dashboard', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }]
        })
      }
    });

    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined)
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clears the active camera stream when scanning is stopped', async () => {
    const { container } = render(<RoleDashboard role="Guard" data={{ visitors: [], students: [], guardians: [] }} userName="Guard Jane" setSheet={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /scans/i }));

    expect(await screen.findByText(/Point the camera/i)).toBeInTheDocument();

    const video = container.querySelector('video');
    expect(video?.srcObject).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /stop/i }));

    expect(screen.getByText(/QR verification ready/i)).toBeInTheDocument();
    expect(video?.srcObject).toBeNull();
  });
});
