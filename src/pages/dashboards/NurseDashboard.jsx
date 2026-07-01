import React from 'react';
import { AlertTriangle, CalendarCheck, FileDown, HeartPulse, Stethoscope } from 'lucide-react';
import { Activity, ListRow, Metric, QuickAction, SectionHeader } from '../../components/SharedUI.jsx';
import { DashboardShell } from '../DashboardShell.jsx';

function NurseDashboard({ data, stats, setSheet }) {
  return (
    <DashboardShell title="Clinic dashboard" subtitle="Health monitoring, treatment logs, and medical follow-up" icon={HeartPulse}>
      <section className="metricGrid">
        <Metric label="Clinic visits" value={data.clinic.length} icon={HeartPulse} />
        <Metric label="Students present" value={stats.present} icon={CalendarCheck} />
        <Metric label="Medicines logged" value={data.clinic.filter((record) => record.medicine !== 'None').length} icon={Stethoscope} />
        <Metric label="Medical alerts" value={data.emergency.length} icon={AlertTriangle} tone="warn" />
      </section>

      <section className="quickGrid">
        <QuickAction icon={HeartPulse} title="Clinic log" text="Record reason, temperature, medicine, and treatment" onClick={() => setSheet('clinic')} />
        <QuickAction icon={Stethoscope} title="Medicine" text="Update treatment plan" onClick={() => setSheet('clinic')} />
        <QuickAction icon={FileDown} title="Health reports" text="Review clinic history" onClick={() => setSheet('clinic')} />
        <QuickAction icon={AlertTriangle} title="Emergency" text="Broadcast medical support alert" onClick={() => setSheet('emergency')} danger />
      </section>

      <SectionHeader title="Recent clinic records" />
      <div className="list">
        {data.clinic.map((record) => (
          <ListRow key={record.id} title={record.student} meta={`${record.reason} · ${record.treatment}`} right={record.medicine} />
        ))}
      </div>

      <SectionHeader title="Medical alerts" />
      <div className="timeline">
        {data.emergency.map((item) => <Activity key={item.id} item={{ ...item, audience: item.time }} />)}
      </div>
    </DashboardShell>
  );
}

export { NurseDashboard };
