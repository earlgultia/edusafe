import React from 'react';
import { AlertTriangle, CalendarCheck, ClipboardCheck, FileDown, Users, X } from 'lucide-react';
import { coreModel } from '../../appContent.js';
import { Activity, Metric, QuickAction, SectionHeader } from '../../components/SharedUI.jsx';
import { DashboardShell } from '../DashboardShell.jsx';

function AdminDashboard({ data, stats, setTab, setSheet }) {
  return (
    <DashboardShell title={data.school.year} subtitle={`${data.school.name} · School-wide operations overview`} icon={Users}>
      <section className="metricGrid">
        <Metric label="Students" value={stats.total} icon={Users} />
        <Metric label="Present" value={stats.present} icon={CalendarCheck} />
        <Metric label="Absent" value={stats.absent} icon={X} tone="warn" />
        <Metric label="Pending Forms" value={stats.pendingForms} icon={FileDown} />
      </section>

      <section className="quickGrid">
        <QuickAction icon={ClipboardCheck} title="School setup" text="Manage school year and sections" onClick={() => setTab('reports')} />
        <QuickAction icon={Users} title="User registry" text="Teachers, parents, and guardians" onClick={() => setTab('people')} />
        <QuickAction icon={FileDown} title="Reports" text="Export records" onClick={() => setTab('reports')} />
        <QuickAction icon={AlertTriangle} title="Emergency" text="Send school-wide alert" onClick={() => setSheet('emergency')} danger />
      </section>

      <SectionHeader title="School Overview" />
      <div className="modelGrid">
        {coreModel.slice(0, 5).map((item) => (
          <article className="modelCard" key={item.entity}>
            <h3>{item.entity}</h3>
            <p>{item.purpose}</p>
          </article>
        ))}
      </div>

      <SectionHeader title="Recent Activity" action="Announcements" onClick={() => setSheet('announcement')} />
      <div className="timeline">
        {data.announcements.slice(0, 4).map((item) => <Activity key={item.id} item={item} />)}
      </div>
    </DashboardShell>
  );
}

export { AdminDashboard };
