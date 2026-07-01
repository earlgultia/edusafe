import React from 'react';
import { AlertTriangle, CalendarCheck, ClipboardCheck, FileDown, Megaphone, ShieldCheck, Users, X } from 'lucide-react';
import { Activity, ListRow, Metric, QuickAction, SectionHeader } from '../../components/SharedUI.jsx';
import { DashboardShell } from '../DashboardShell.jsx';

function AdminDashboard({ data, stats, setTab, setSheet }) {
  return (
    <DashboardShell title={data.school.year} subtitle={`${data.school.name} · Principal overview`} icon={ShieldCheck}>
      <section className="metricGrid">
        <Metric label="Total students" value={stats.total} icon={Users} />
        <Metric label="Present today" value={stats.present} icon={CalendarCheck} />
        <Metric label="Absent today" value={stats.absent} icon={X} tone="warn" />
        <Metric label="Pending forms" value={stats.pendingForms} icon={FileDown} />
      </section>

      <section className="quickGrid">
        <QuickAction icon={ClipboardCheck} title="School setup" text="Manage school year, grade levels, and sections" onClick={() => setTab('reports')} />
        <QuickAction icon={Users} title="User registry" text="Teachers, parents, and guardians" onClick={() => setTab('people')} />
        <QuickAction icon={Megaphone} title="Announcements" text="Publish school-wide notices" onClick={() => setSheet('announcement')} />
        <QuickAction icon={AlertTriangle} title="Emergency" text="Send school-wide alert" onClick={() => setSheet('emergency')} danger />
      </section>

      <SectionHeader title="Operational Snapshot" />
      <div className="modelGrid">
        <article className="modelCard">
          <h3>Visitors on campus</h3>
          <p>{data.visitors.filter((item) => item.status === 'On campus').length} active visitors checked in</p>
        </article>
        <article className="modelCard">
          <h3>Recent incidents</h3>
          <p>{data.incidents.length} incident reports logged</p>
        </article>
        <article className="modelCard">
          <h3>Clinic visits</h3>
          <p>{data.clinic.length} student visits recorded</p>
        </article>
        <article className="modelCard">
          <h3>Pickup logs</h3>
          <p>{data.students.filter((student) => student.release === 'Released').length} students released</p>
        </article>
      </div>

      <SectionHeader title="Recent school activity" action="Reports" onClick={() => setTab('reports')} />
      <div className="list">
        {data.announcements.slice(0, 4).map((item) => (
          <ListRow key={item.id} title={item.title} meta={item.audience} right={item.time} />
        ))}
      </div>
    </DashboardShell>
  );
}

export { AdminDashboard };
