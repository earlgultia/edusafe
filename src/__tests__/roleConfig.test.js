import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { getRoleNavigation, getRoleProfile } from '../data/roleConfig.js';
import { RoleDashboard } from '../pages/dashboards/RoleDashboard.jsx';

describe('role navigation config', () => {
  it('returns teacher navigation with attendance and people tabs', () => {
    const navigation = getRoleNavigation('Teacher');

    expect(navigation.map((item) => item.tab)).toEqual(['home', 'attendance', 'people', 'events', 'lost', 'release', 'comms']);
    expect(navigation.find((item) => item.tab === 'attendance')).toMatchObject({ label: 'Attendance', icon: 'check_circle' });
  });

  it('returns guard navigation with security access', () => {
    const navigation = getRoleNavigation('Guard');

    expect(navigation.map((item) => item.tab)).toEqual(['home', 'security']);
    expect(navigation.find((item) => item.tab === 'security')).toMatchObject({ label: 'Security', icon: 'shield' });
  });

  it('provides role profile titles for the shell', () => {
    expect(getRoleProfile('Admin')).toMatchObject({ title: 'Admin Dashboard' });
    expect(getRoleProfile('Nurse')).toMatchObject({ title: 'Nurse Station' });
  });

  it('renders teacher navigation items from the shared configuration', () => {
    render(
      React.createElement(RoleDashboard, {
        role: 'Teacher',
        data: { students: [], teachers: [], guardians: [] },
        stats: {},
        userName: 'Teacher Jane',
        auth: { email: 'teacher@example.com' },
        setSheet: () => {},
        actions: {}
      })
    );

    expect(screen.getByRole('button', { name: /attendance/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /people/i })).toBeInTheDocument();
  });
});
