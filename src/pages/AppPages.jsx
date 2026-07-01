import React from 'react';
import { AlertTriangle, FileDown, IdCard, Users } from 'lucide-react';
import { Activity, ListRow, Metric, QuickAction, SectionHeader } from '../components/SharedUI.jsx';
import { AdminDashboard } from './dashboards/AdminDashboard.jsx';
import { TeacherDashboard } from './dashboards/TeacherDashboard.jsx';
import { ParentDashboard } from './dashboards/ParentDashboard.jsx';
import { GuardDashboard } from './dashboards/GuardDashboard.jsx';
import { NurseDashboard } from './dashboards/NurseDashboard.jsx';

function DashboardPage({ data, stats, role, setTab, setSheet }) {
  const dashboards = {
    Admin: <AdminDashboard data={data} stats={stats} setTab={setTab} setSheet={setSheet} />,
    Teacher: <TeacherDashboard data={data} stats={stats} setSheet={setSheet} />,
    Parent: <ParentDashboard data={data} stats={stats} setSheet={setSheet} />,
    Guard: <GuardDashboard data={data} stats={stats} setSheet={setSheet} />,
    Nurse: <NurseDashboard data={data} stats={stats} setSheet={setSheet} />
  };

  return dashboards[role] || dashboards.Admin;
}

function PeoplePage({ data, setSheet, actions }) {
  return (
    <div className="stack">
      <SectionHeader title="Students" action="Add" onClick={() => setSheet('student')} />
      <div className="searchBox"><Users size={18} /><span>Search by name, LRN, grade, or section</span></div>
      <div className="list">
        {data.students.map((s) => (
          <article className="person" key={s.id}>
            <div className="avatar">{s.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</div>
            <div>
              <h3>{s.name}</h3>
              <p>{s.lrn} · {s.grade} - {s.section}</p>
              <div className="chips">
                {['Present', 'Absent', 'Late', 'Excused'].map((status) => (
                  <button key={status} className={s.status === status ? 'selected' : ''} onClick={() => actions.markAttendance(s.id, status)}>{status}</button>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <SectionHeader title="Teachers" action="Add" onClick={() => setSheet('teacher')} />
      <div className="list">
        {data.teachers.map((t) => <ListRow key={t.id} title={t.name} meta={`${t.employeeNo} · ${t.advisory}`} right={t.position} />)}
      </div>

      <SectionHeader title="Guardians" action="QR verify" onClick={() => setSheet('release')} />
      <div className="list">
        {data.guardians.map((g) => <ListRow key={g.id} title={g.name} meta={`${g.relation} · ${g.phone}`} right={g.verified ? 'Verified' : 'Pending'} />)}
      </div>
    </div>
  );
}

function SafetyPage({ data, setSheet, actions }) {
  return (
    <div className="stack">
      <section className="safetyPanel visitorHeroPanel">
        <div>
          <span>Visitor control</span>
          <h2>Check visitors in, generate a pass, and close the loop on checkout.</h2>
          <p>Everything stays visible for guards and administrators on a mobile screen.</p>
        </div>
        <button className="smallBtn" onClick={() => setSheet('visitor')}>New visitor</button>
      </section>

      <SectionHeader title="Active Visitors" action="Check out" onClick={() => setSheet('visitor')} />
      <div className="list">
        {data.visitors.map((v) => (
          <article className="row" key={v.id}>
            <div>
              <h3>{v.name}</h3>
              <p>{v.purpose} · Visiting {v.person}</p>
            </div>
            {v.status === 'On campus'
              ? <button className="smallBtn" onClick={() => actions.checkoutVisitor(v.id)}>Check out</button>
              : <span className="status">{v.timeOut}</span>}
          </article>
        ))}
      </div>

      <SectionHeader title="Visitor Log" />
      <div className="list">
        {data.visitorLog.map((visit) => (
          <article className="row" key={visit.id}>
            <div>
              <h3>{visit.name}</h3>
              <p>{visit.purpose} · {visit.timeIn}{visit.timeOut ? ` to ${visit.timeOut}` : ''}</p>
            </div>
            <span className="status">{visit.status}</span>
          </article>
        ))}
      </div>

      <SectionHeader title="Incidents" action="Report" onClick={() => setSheet('incident')} />
      <div className="list">
        {data.incidents.map((i) => <ListRow key={i.id} title={i.type} meta={`${i.student} · ${i.description}`} right={i.status} />)}
      </div>

      <SectionHeader title="School Clinic" action="Record" onClick={() => setSheet('clinic')} />
      <div className="list">
        {data.clinic.map((c) => <ListRow key={c.id} title={c.student} meta={`${c.reason} · ${c.temp} · ${c.treatment}`} right={c.medicine} />)}
      </div>

      <section className="safetyPanel alertHeroPanel">
        <div>
          <span>Emergency control</span>
          <h2>Send a high-priority alert to every active user in seconds.</h2>
          <p>Fire, earthquake, flood, intruder, and medical alert options are ready to trigger.</p>
        </div>
        <button className="smallBtn" onClick={() => setSheet('emergency')}><AlertTriangle size={18} /> Send alert</button>
      </section>

      <SectionHeader title="Emergency History" />
      <div className="list">
        {data.emergency.map((item) => (
          <article className="row" key={item.id}>
            <div>
              <h3>{item.type}</h3>
              <p>{item.time}</p>
            </div>
            <span className="status">{item.status}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function CommsPage({ data, setSheet }) {
  return (
    <div className="stack">
      <SectionHeader title="Announcements" action="Publish" onClick={() => setSheet('announcement')} />
      <div className="timeline">
        {data.announcements.map((item) => <Activity key={item.id} item={item} />)}
      </div>

      <SectionHeader title="Digital Forms" action="Create" onClick={() => setSheet('form')} />
      <div className="list">
        {data.forms.map((form) => (
          <article className="formRow" key={form.id}>
            <div>
              <h3>{form.title}</h3>
              <p>{form.audience} · {form.status}</p>
              <progress value={form.submitted} max={form.total} />
            </div>
            <span>{form.submitted}/{form.total}</span>
          </article>
        ))}
      </div>

      <SectionHeader title="Lost & Found" action="Add item" onClick={() => setSheet('lost')} />
      <div className="list">
        {data.lostFound.map((item) => <ListRow key={item.id} title={item.item} meta={`${item.location} · ${item.date}`} right={item.status} />)}
      </div>
    </div>
  );
}

function ReportsPage({ data, stats }) {
  const reports = [
    ['Daily Attendance', `${stats.present}/${stats.total} checked in`],
    ['Monthly Attendance', 'Ready for export'],
    ['Visitor Logs', `${data.visitors.length} records`],
    ['Clinic Reports', `${data.clinic.length} visits`],
    ['Incident Reports', `${data.incidents.length} reports`],
    ['Pickup Logs', `${data.students.filter((s) => s.release === 'Released').length} releases`],
    ['Lost & Found Reports', `${data.lostFound.length} items`]
  ];

  return (
    <div className="stack">
      <section className="reportHero">
        <FileDown size={28} />
        <div>
          <h2>Operational Reports</h2>
          <p>Generate PDF or Excel-ready school records.</p>
        </div>
      </section>
      <div className="list">
        {reports.map(([title, meta]) => <ListRow key={title} title={title} meta={meta} right="Export" />)}
      </div>
    </div>
  );
}

export { DashboardPage, PeoplePage, SafetyPage, CommsPage, ReportsPage };
