import React from 'react';
import { AlertTriangle, FileDown, IdCard, QrCode, UserCheck, X } from 'lucide-react';
import { Activity, ListRow, Metric, QuickAction, SectionHeader } from '../../components/SharedUI.jsx';
import { DashboardShell } from '../DashboardShell.jsx';

function GuardDashboard({ data, stats, setSheet }) {
  return (
    <DashboardShell title="Guard dashboard" subtitle="Visitor registration, QR verification, and campus monitoring" icon={IdCard}>
      <section className="metricGrid">
        <Metric label="Visitors" value={stats.visitors} icon={IdCard} />
        <Metric label="Checked in" value={data.visitors.filter((v) => v.status === 'On campus').length} icon={UserCheck} />
        <Metric label="Checked out" value={data.visitorLog.filter((v) => v.status === 'Checked out').length} icon={X} tone="warn" />
        <Metric label="Active alerts" value={data.emergency.length} icon={AlertTriangle} tone="warn" />
      </section>

      <section className="quickGrid">
        <QuickAction icon={IdCard} title="New visitor" text="Register a visitor and purpose" onClick={() => setSheet('visitor')} />
        <QuickAction icon={QrCode} title="Verify guardian" text="Scan QR and confirm identity" onClick={() => setSheet('release')} />
        <QuickAction icon={AlertTriangle} title="Emergency" text="Broadcast a security alert" onClick={() => setSheet('emergency')} danger />
        <QuickAction icon={FileDown} title="Visitor log" text="Review entries and exits" onClick={() => setSheet('visitor')} />
      </section>

      <SectionHeader title="Active visitors" />
      <div className="list">
        {data.visitors.map((visitor) => (
          <ListRow key={visitor.id} title={visitor.name} meta={`${visitor.purpose} · ${visitor.person}`} right={visitor.status} />
        ))}
      </div>

      <SectionHeader title="Campus alerts" />
      <div className="timeline">
        {data.emergency.map((item) => <Activity key={item.id} item={{ ...item, audience: item.time }} />)}
      </div>
    </DashboardShell>
  );
}

export { GuardDashboard };
