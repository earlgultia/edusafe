import React from 'react';
import { AlertTriangle, CalendarCheck, HeartPulse, Megaphone, QrCode, UserCheck } from 'lucide-react';
import { Activity, Metric, QuickAction, SectionHeader } from '../../components/SharedUI.jsx';
import { DashboardShell } from '../DashboardShell.jsx';

function ParentDashboard({ data, stats, setSheet }) {
  const child = data.students[0];

  return (
    <DashboardShell title="Parent dashboard" subtitle="Child safety updates, pickup history, and announcements" icon={UserCheck}>
      <section className="metricGrid">
        <Metric label="Attendance" value={`${stats.present}/${stats.total}`} icon={CalendarCheck} />
        <Metric label="Pickup history" value={data.pickupLog.length} icon={QrCode} />
        <Metric label="Clinic visits" value={data.clinic.length} icon={HeartPulse} />
        <Metric label="Alerts" value={data.emergency.length} icon={AlertTriangle} tone="warn" />
      </section>

      <section className="quickGrid">
        <QuickAction icon={CalendarCheck} title="Attendance" text="View child status" onClick={() => setSheet('attendance')} />
        <QuickAction icon={QrCode} title="Pickup" text="See guardian releases" onClick={() => setSheet('pickup')} />
        <QuickAction icon={HeartPulse} title="Clinic" text="Review health notes" onClick={() => setSheet('clinic')} />
        <QuickAction icon={Megaphone} title="Announcements" text="Open school notices" onClick={() => setSheet('announcement')} />
      </section>

      <SectionHeader title="Child Snapshot" />
      <div className="modelGrid">
        <article className="modelCard">
          <h3>{child?.name || 'Student'}</h3>
          <p>{child?.grade} - {child?.section} · {child?.status} · {child?.medical}</p>
        </article>
        <article className="modelCard">
          <h3>Pickup history</h3>
          <p>{data.pickupLog[0]?.guardian || 'No pickup yet'} · {data.pickupLog[0]?.time || 'No time yet'}</p>
        </article>
      </div>

      <SectionHeader title="Latest Announcements" />
      <div className="timeline">
        {data.announcements.slice(0, 3).map((item) => <Activity key={item.id} item={item} />)}
      </div>
    </DashboardShell>
  );
}

export { ParentDashboard };
