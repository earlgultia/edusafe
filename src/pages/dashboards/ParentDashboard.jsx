import React from 'react';
import { AlertTriangle, CalendarCheck, FileText, HeartPulse, Megaphone, QrCode, UserCheck } from 'lucide-react';
import { Activity, ListRow, Metric, QuickAction, SectionHeader } from '../../components/SharedUI.jsx';
import { DashboardShell } from '../DashboardShell.jsx';

function ParentDashboard({ data, stats, setSheet }) {
  const child = data.students[0];

  return (
    <DashboardShell title="Parent dashboard" subtitle="Attendance, pickup, clinic, and school updates" icon={UserCheck}>
      <section className="metricGrid">
        <Metric label="Attendance" value={`${stats.present}/${stats.total}`} icon={CalendarCheck} />
        <Metric label="Pickup history" value={data.pickupLog.length} icon={QrCode} />
        <Metric label="Clinic visits" value={data.clinic.length} icon={HeartPulse} />
        <Metric label="New alerts" value={data.emergency.length} icon={AlertTriangle} tone="warn" />
      </section>

      <section className="quickGrid">
        <QuickAction icon={CalendarCheck} title="Attendance" text="Track your child's day" onClick={() => setSheet('attendance')} />
        <QuickAction icon={QrCode} title="Pickup" text="Review guardian release history" onClick={() => setSheet('pickup')} />
        <QuickAction icon={HeartPulse} title="Clinic" text="Review health notes and medicine" onClick={() => setSheet('clinic')} />
        <QuickAction icon={FileText} title="Forms" text="Complete consent and update forms" onClick={() => setSheet('form')} />
      </section>

      <SectionHeader title="Child snapshot" />
      <div className="modelGrid">
        <article className="modelCard">
          <h3>{child?.name || 'Student'}</h3>
          <p>{child?.grade} - {child?.section} · {child?.status} · {child?.medical}</p>
        </article>
        <article className="modelCard">
          <h3>Latest pickup</h3>
          <p>{data.pickupLog[0]?.guardian || 'No pickup yet'} · {data.pickupLog[0]?.time || 'No time yet'}</p>
        </article>
      </div>

      <SectionHeader title="Latest announcements" action="View all" onClick={() => setSheet('announcement')} />
      <div className="timeline">
        {data.announcements.slice(0, 3).map((item) => <Activity key={item.id} item={item} />)}
      </div>

      <SectionHeader title="Recent school notices" />
      <div className="list">
        {data.announcements.slice(0, 2).map((item) => (
          <ListRow key={item.id} title={item.title} meta={item.audience} right={item.time} />
        ))}
      </div>
    </DashboardShell>
  );
}

export { ParentDashboard };
