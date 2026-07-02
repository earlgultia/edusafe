import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CalendarView } from '../components/CalendarView.jsx';

describe('CalendarView', () => {
  it('renders events and shows details on click', () => {
    const events = [{ id: 'e1', title: 'Event 1', date: '2026-07-10', location: 'Hall', details: 'Details here' }];
    render(<CalendarView events={events} />);
    expect(screen.getByText('Event 1')).toBeDefined();
    fireEvent.click(screen.getByText('Event 1'));
    expect(screen.getByText('Details here')).toBeDefined();
  });
});
