import React from 'react';
import { AdminDashboard } from './dashboards/AdminDashboard.jsx';

function DashboardPage({ data, stats, role, setSheet }) {
  return <AdminDashboard data={data} stats={stats} setSheet={setSheet} />;
}

export { DashboardPage };
