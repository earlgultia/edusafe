import React from 'react';
import { AlertTriangle, CalendarCheck, ClipboardCheck, FileDown, Megaphone, QrCode, UserCheck, X } from 'lucide-react';
import { Activity, ListRow, Metric, QuickAction, SectionHeader } from '../../components/SharedUI.jsx';
import { DashboardShell } from '../DashboardShell.jsx';

function TeacherDashboard({ data, stats, setSheet }) {
  return (
    <DashboardShell title="Teacher dashboard" subtitle="Attendance, release, incidents, and class updates" icon={ClipboardCheck}>
      <section className="metricGrid">
        <Metric label="Today present" value={stats.present} icon={CalendarCheck} />
        <Metric label="Absent" value={stats.absent} icon={X} tone="warn" />
        <Metric label="Not released" value={data.students.filter((s) => s.release === 'Waiting').length} icon={UserCheck} />
        <Metric label="Pending forms" value={data.forms.filter((form) => form.status === 'Pending').length} icon={FileDown} />
      </section>

      <section className="quickGrid">
        <QuickAction icon={ClipboardCheck} title="Attendance" text="Mark present, absent, late, or excused" onClick={() => setSheet('attendance')} />
        <QuickAction icon={QrCode} title="Release student" text="Verify guardian QR and release" onClick={() => setSheet('pickup')} />
        <QuickAction icon={AlertTriangle} title="Incident report" text="Record bullying, injury, or other issues" onClick={() => setSheet('incident')} />
        <QuickAction icon={Megaphone} title="Announcements" text="Share class updates" onClick={() => setSheet('announcement')} />
      </section>

      <SectionHeader title="Attendance queue" action="Open" onClick={() => setSheet('attendance')} />
      <div className="list">
        {data.students.slice(0, 4).map((student) => (
          <ListRow key={student.id} title={student.name} meta={`${student.grade} - ${student.section}`} right={student.status} />
        ))}
      </div>

      <SectionHeader title="Recent class updates" />
      <div className="timeline">
        {data.announcements.slice(0, 3).map((item) => <Activity key={item.id} item={item} />)}
      </div>
    </DashboardShell>
  );
}

export { TeacherDashboard };
