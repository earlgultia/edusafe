import React, { useMemo, useState } from 'react';
import { AdminDashboard } from './AdminDashboard.jsx';
import { ParentDashboard } from './ParentDashboard.jsx';
import { PeopleSheet } from '../../components/PeopleSheet.jsx';

function TeacherDashboard({ data = {}, stats = {}, userName = 'Teacher', setSheet, actions }) {
  const [activeTab, setActiveTab] = useState('home');
  const students = data.students || [];
  const announcements = data.announcements || [];
  const incidents = data.incidents || [];
  const totalStudents = students.length;
  const present = students.filter((student) => student.status === 'Present').length;
  const absent = students.filter((student) => student.status === 'Absent').length;
  const late = students.filter((student) => student.status === 'Late').length;
  const verifiedGuardians = (data.guardians || []).filter((guardian) => guardian.verified).length;
  const recentStudents = students.slice(0, 3);
  const guardianQueue = (data.guardians || []).slice(0, 3);

  const activity = useMemo(() => {
    return [
      ...(announcements.slice(0, 1).map((item) => ({ id: `announcement-${item.id}`, title: item.title, summary: item.body, time: 'Today', tone: item.priority === 'Critical' ? 'alert' : 'normal' })) || []),
      ...(incidents.slice(0, 1).map((item) => ({ id: `incident-${item.id}`, title: `${item.type} report`, summary: item.description, time: 'Today', tone: 'alert' })) || [])
    ];
  }, [announcements, incidents]);

  const openSheet = (sheet) => setSheet?.(sheet);

  const renderContent = () => {
    switch (activeTab) {
      case 'people':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>People</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('teacher')}>Add Teacher</button>
            </div>
            <PeopleSheet data={data} />
          </section>
        );
      case 'comms':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>Announcements</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('announcement')}>Publish Notice</button>
            </div>
            <div className="featureList">
              {announcements.map((item) => (
                <article key={item.id} className="reportRow">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                  <span>{item.audience}</span>
                </article>
              ))}
              {!announcements.length && <p className="emptyText">No announcements yet.</p>}
            </div>
          </section>
        );
      case 'release':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>Release queue</h2>
              <button className="smallBtn" type="button" onClick={() => setActiveTab('home')}>Dashboard</button>
            </div>
            <section className="featureList">
              <article className="featureCard">
                <h3>Verified guardians</h3>
                <p>{verifiedGuardians} guardians ready for pickup approval.</p>
              </article>
              <article className="featureCard">
                <h3>Students pending release</h3>
                <p>{guardianQueue.length} awaiting guardian pickup.</p>
              </article>
            </section>
            <section className="verifyList">
              {(data.guardians || []).map((guardian) => {
                const student = (data.students || []).find((s) => s.id === guardian.studentId);
                return (
                  <article key={guardian.id} className="verifyCard">
                    <div className="qrBox">
                      <span className="material-symbols-outlined">qr_code</span>
                    </div>
                    <div>
                      <h3>{guardian.name}</h3>
                      <p>{guardian.relation} for {student?.name || 'Unknown student'}</p>
                      <small>{guardian.qr}</small>
                    </div>
                    <button
                      className={guardian.verified ? 'smallBtn' : 'smallBtn disabled'}
                      type="button"
                      onClick={() => { if (guardian.verified) { actions.releaseStudent(guardian.id); setActiveTab('home'); } }}
                    >
                      {guardian.verified ? 'Release' : 'Denied'}
                    </button>
                  </article>
                );
              })}
              {!guardianQueue.length && <p className="emptyText">No guardians queued for release.</p>}
            </section>
          </section>
        );
      default:
        return (
          <section className="tabPage">
            <section className="sectionTitleBlock">
              <span>Teacher workspace</span>
              <h2>Welcome, {userName}</h2>
            </section>
            <section className="metricGrid">
              <article className="heroCard">
                <div className="heroCardHeader">
                  <span className="material-symbols-outlined heroIcon">analytics</span>
                  <span className="badge">CLASS</span>
                </div>
                <div>
                  <p className="heroValue">{totalStudents}</p>
                  <p className="heroLabel">Students managed</p>
                </div>
              </article>
              <article className="metricCard presentCard">
                <div className="metricCardHeader">
                  <span className="material-symbols-outlined metricIcon">check_circle</span>
                  <span className="metricBadge">Present</span>
                </div>
                <div>
                  <p className="metricValue">{present}</p>
                  <p className="metricText">Today</p>
                </div>
              </article>
              <article className="metricCard lightCard">
                <div className="metricCardHeader">
                  <span className="material-symbols-outlined metricIcon muted">person_off</span>
                  <span className="metricBadge alertBadge">Absent</span>
                </div>
                <div>
                  <p className="metricValue">{absent}</p>
                  <p className="metricText">Today</p>
                </div>
              </article>
              <article className="metricCard visitorCard">
                <div className="metricCardHeader">
                  <span className="material-symbols-outlined metricIcon">schedule</span>
                  <span className="metricBadge">Late</span>
                </div>
                <div>
                  <p className="metricValue">{late}</p>
                  <p className="metricText">Today</p>
                </div>
              </article>
            </section>
            <section className="sectionHeader">
              <h2>Quick actions</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('attendance')}>Mark Attendance</button>
            </section>
            <section className="workflowList">
              <button type="button" className="workflowCard" onClick={() => openSheet('incident')}>
                <div>
                  <h3>Report Incident</h3>
                  <p>Log classroom safety issues.</p>
                </div>
                <small>Incident</small>
              </button>
              <button type="button" className="workflowCard" onClick={() => openSheet('announcement')}>
                <div>
                  <h3>Send Notice</h3>
                  <p>Notify parents and staff.</p>
                </div>
                <small>Comms</small>
              </button>
              <button type="button" className="workflowCard" onClick={() => setActiveTab('release')}>
                <div>
                  <h3>Release student</h3>
                  <p>Approve verified guardian pickup.</p>
                </div>
                <small>Release</small>
              </button>
            </section>
            <section className="featureList">
              {recentStudents.map((student) => (
                <article key={student.id} className="reportRow">
                  <div>
                    <h3>{student.name}</h3>
                    <p>{student.grade} • {student.section}</p>
                  </div>
                  <span>{student.status}</span>
                </article>
              ))}
              {!recentStudents.length && <p className="emptyText">No students assigned yet.</p>}
            </section>
            <section className="activityHeader">
              <h2>Recent activity</h2>
              <button className="textButton" type="button">View All</button>
            </section>
            <section className="activityList">
              {activity.map((item) => (
                <article key={item.id} className={`activityItem ${item.tone === 'alert' ? 'activityAlert' : 'activityNormal'}`}>
                  <div className={`activityIcon ${item.tone === 'alert' ? 'alertIcon' : 'normalIcon'}`}>
                    <span className="material-symbols-outlined">{item.tone === 'alert' ? 'emergency_home' : 'report_problem'}</span>
                  </div>
                  <div className="activityBody">
                    <div className="activityTitleRow">
                      <h3>{item.title}</h3>
                      <span>{item.time}</span>
                    </div>
                    <p>{item.summary}</p>
                  </div>
                </article>
              ))}
              {!activity.length && <p className="emptyText">No recent activity yet.</p>}
            </section>
          </section>
        );
    }
  };

  return (
    <div className="adminPage">
      <main className="adminContent">{renderContent()}</main>
      <nav className="bottomNav">
        <button className={`navButton ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <span className="material-symbols-outlined">home</span>
          <span>Home</span>
        </button>
        <button className={`navButton ${activeTab === 'people' ? 'active' : ''}`} onClick={() => setActiveTab('people')}>
          <span className="material-symbols-outlined">people</span>
          <span>People</span>
        </button>
        <button className={`navButton ${activeTab === 'release' ? 'active' : ''}`} onClick={() => setActiveTab('release')}>
          <span className="material-symbols-outlined">send</span>
          <span>Release</span>
        </button>
        <button className={`navButton ${activeTab === 'comms' ? 'active' : ''}`} onClick={() => setActiveTab('comms')}>
          <span className="material-symbols-outlined">chat</span>
          <span>Comms</span>
        </button>
      </nav>
    </div>
  );
}

function GuardDashboard({ data = {}, userName = 'Guard', setSheet }) {
  const [activeTab, setActiveTab] = useState('home');
  const visitors = (data.visitors || []).filter((v) => v.status === 'On campus').length;
  const studentWaiting = (data.students || []).filter((student) => student.release === 'Waiting').length;
  const recentVisitors = (data.visitors || []).slice(0, 3);
  const openSheet = (sheet) => setSheet?.(sheet);

  const renderContent = () => {
    switch (activeTab) {
      case 'security':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>Security tasks</h2>
            </div>
            <section className="workflowList">
              <button type="button" className="workflowCard" onClick={() => openSheet('guard_visitor')}>
                <div>
                  <h3>Log Visitor</h3>
                  <p>Record arrivals and issue a campus pass.</p>
                </div>
                <small>Visitor</small>
              </button>
              <button type="button" className="workflowCard" onClick={() => openSheet('release')}>
                <div>
                  <h3>Release student</h3>
                  <p>Authorize guardian pickup.</p>
                </div>
                <small>Pickup</small>
              </button>
            </section>
            <section className="featureList">
              {recentVisitors.map((visitor) => (
                <article key={visitor.id} className="reportRow">
                  <div>
                    <h3>{visitor.name}</h3>
                    <p>{visitor.purpose}</p>
                  </div>
                  <span>{visitor.status}</span>
                </article>
              ))}
              {!recentVisitors.length && <p className="emptyText">No active visitors.</p>}
            </section>
          </section>
        );
      default:
        return (
          <section className="tabPage">
            <section className="sectionTitleBlock">
              <span>Guard workspace</span>
              <h2>Welcome, {userName}</h2>
            </section>
            <section className="metricGrid">
              <article className="featureCard">
                <h3>Visitors on campus</h3>
                <p>{visitors}</p>
              </article>
              <article className="featureCard">
                <h3>Pickup queue</h3>
                <p>{studentWaiting} waiting</p>
              </article>
              <article className="featureCard">
                <h3>Verified guardians</h3>
                <p>{(data.guardians || []).filter((guardian) => guardian.verified).length}</p>
              </article>
              <article className="featureCard">
                <h3>Scans</h3>
                <p>QR verification ready</p>
              </article>
            </section>
            <section className="featureList">
              <article className="featureCard">
                <h3>Quick safety actions</h3>
                <p>Use the security tab to manage visitors and pickups.</p>
              </article>
            </section>
          </section>
        );
    }
  };

  return (
    <div className="adminPage">
      <main className="adminContent">{renderContent()}</main>
      <nav className="bottomNav">
        <button className={`navButton ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <span className="material-symbols-outlined">home</span>
          <span>Home</span>
        </button>
        <button className={`navButton ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
          <span className="material-symbols-outlined">shield</span>
          <span>Security</span>
        </button>
      </nav>
    </div>
  );
}

function NurseDashboard({ data = {}, userName = 'Nurse', setSheet }) {
  const [activeTab, setActiveTab] = useState('home');
  const clinicVisits = data.clinic || [];
  const incidents = data.incidents || [];
  const openSheet = (sheet) => setSheet?.(sheet);

  const renderContent = () => {
    switch (activeTab) {
      case 'clinic':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>Clinic records</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('clinic')}>New Record</button>
            </div>
            <div className="featureList">
              {clinicVisits.slice(0, 4).map((visit) => (
                <article key={visit.id} className="reportRow">
                  <div>
                    <h3>{visit.student}</h3>
                    <p>{visit.reason}</p>
                  </div>
                  <span>{visit.temp}</span>
                </article>
              ))}
              {!clinicVisits.length && <p className="emptyText">No clinic records yet.</p>}
            </div>
          </section>
        );
      default:
        return (
          <section className="tabPage">
            <section className="sectionTitleBlock">
              <span>Nurse workspace</span>
              <h2>Welcome, {userName}</h2>
            </section>
            <section className="metricGrid">
              <article className="featureCard">
                <h3>Clinic visits</h3>
                <p>{clinicVisits.length}</p>
              </article>
              <article className="featureCard">
                <h3>Recent incidents</h3>
                <p>{incidents.length}</p>
              </article>
              <article className="featureCard">
                <h3>Students</h3>
                <p>{(data.students || []).length}</p>
              </article>
              <article className="featureCard">
                <h3>Health logs</h3>
                <p>Ready to update</p>
              </article>
            </section>
            <section className="sectionHeader">
              <h2>Health workflow</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('clinic')}>New Record</button>
            </section>
          </section>
        );
    }
  };

  return (
    <div className="adminPage">
      <main className="adminContent">{renderContent()}</main>
      <nav className="bottomNav">
        <button className={`navButton ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <span className="material-symbols-outlined">home</span>
          <span>Home</span>
        </button>
        <button className={`navButton ${activeTab === 'clinic' ? 'active' : ''}`} onClick={() => setActiveTab('clinic')}>
          <span className="material-symbols-outlined">local_hospital</span>
          <span>Clinic</span>
        </button>
      </nav>
    </div>
  );
}

function RoleDashboard({ role, data, stats, userName, setSheet, signOut, actions }) {
  switch (role) {
    case 'Teacher':
      return <TeacherDashboard data={data} stats={stats} userName={userName} setSheet={setSheet} signOut={signOut} actions={actions} />;
    case 'Parent':
      return <ParentDashboard data={data} userName={userName} setSheet={setSheet} signOut={signOut} />;
    case 'Guard':
      return <GuardDashboard data={data} userName={userName} setSheet={setSheet} signOut={signOut} />;
    case 'Nurse':
      return <NurseDashboard data={data} userName={userName} setSheet={setSheet} signOut={signOut} />;
    case 'Admin':
    default:
      return <AdminDashboard data={data} stats={stats} userName={userName} setSheet={setSheet} signOut={signOut} />;
  }
}

export { RoleDashboard };
