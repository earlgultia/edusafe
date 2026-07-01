import React, { useState } from 'react';

function ParentDashboard({ data = {}, userName = 'Parent', setSheet }) {
  const [activeTab, setActiveTab] = useState('home');
  const announcements = data.announcements || [];
  const students = data.students || [];
  const student = students[0] || {};
  const guardians = data.guardians || [];
  const childGuardians = guardians.filter((guardian) => guardian.studentId === student.id);
  const attendanceLog = data.attendanceLog || [];
  const studentAttendance = attendanceLog.filter((entry) => entry.studentId === student.id);
  const present = studentAttendance.filter((entry) => entry.status === 'Present').length;
  const absent = studentAttendance.filter((entry) => entry.status === 'Absent').length;
  const late = studentAttendance.filter((entry) => entry.status === 'Late').length;
  const excused = studentAttendance.filter((entry) => entry.status === 'Excused').length;
  const attendanceSummary = studentAttendance.length
    ? `${present} present · ${absent} absent · ${late} late · ${excused} excused`
    : 'Attendance data not available yet';
  const openSheet = (sheet) => setSheet?.(sheet);
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'messages':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>Family messages</h2>
              <p className="sectionNote">All notifications and announcements for your linked student.</p>
            </div>
            <div className="featureList">
              {announcements.slice(0, 4).map((item) => (
                <article key={item.id} className="reportRow">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                  <span>{item.audience}</span>
                </article>
              ))}
              {!announcements.length && <p className="emptyText">No notices yet.</p>}
            </div>
          </section>
        );
      default:
        return (
          <section className="tabPage">
            <section className="dashboardHeader cleanHeader">
              <div className="headerTitleBlock">
                <span className="headerDate">{dateLabel}</span>
                <h3>Parent Overview</h3>
                <p className="headerPersona">Parent • {userName}</p>
              </div>
            </section>

            <section className="actionGrid parentActions">
              <button type="button" className="actionCard" onClick={() => openSheet('form')}>
                <span className="material-symbols-outlined">file_upload</span>
                <div>
                  <strong>Submit forms</strong>
                  <small>Share permission slips or approvals.</small>
                </div>
              </button>
              <button type="button" className="actionCard" onClick={() => openSheet('guardian_qr')}>
                <span className="material-symbols-outlined">qr_code</span>
                <div>
                  <strong>Generate Guardian QR</strong>
                  <small>Create or share a verified guardian pass.</small>
                </div>
              </button>
              <div className="actionCard passiveCard">
                <span className="material-symbols-outlined">school</span>
                <div>
                  <strong>Monitor attendance</strong>
                  <small>See your child’s attendance summary.</small>
                </div>
              </div>
              <div className="actionCard passiveCard">
                <span className="material-symbols-outlined">notifications</span>
                <div>
                  <strong>Receive notifications</strong>
                  <small>Stay updated with school alerts.</small>
                </div>
              </div>
            </section>

            <section className="metricGrid">
              <article className="featureCard">
                <h3>Your child</h3>
                <p>{student.name || 'Student profile not linked'}</p>
              </article>
              <article className="featureCard">
                <h3>Attendance</h3>
                <p>{attendanceSummary}</p>
              </article>
              <article className="featureCard">
                <h3>Guardian QR</h3>
                <p>{childGuardians.length} linked guardian(s)</p>
              </article>
              <article className="featureCard">
                <h3>Notifications</h3>
                <p>{announcements.length} recent update(s)</p>
              </article>
            </section>

            <section className="sectionHeader">
              <h2>Latest updates</h2>
              <button className="smallBtn" type="button" onClick={() => setActiveTab('messages')}>View all</button>
            </section>
            <div className="featureList">
              {announcements.slice(0, 2).map((item) => (
                <article key={item.id} className="reportRow">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                  <span>{item.audience}</span>
                </article>
              ))}
              {!announcements.length && <p className="emptyText">No latest updates yet.</p>}
            </div>

            <section className="sectionHeader">
              <h2>Guardian passes</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('guardian')}>Manage guardians</button>
            </section>
            <div className="featureList">
              {childGuardians.map((guardian) => (
                <article key={guardian.id} className="reportRow">
                  <div>
                    <h3>{guardian.name}</h3>
                    <p>{guardian.relation}</p>
                    <small>{guardian.qr}</small>
                  </div>
                  <span>{guardian.verified ? 'Verified' : 'Pending'}</span>
                </article>
              ))}
              {!childGuardians.length && <p className="emptyText">No guardian QR passes available.</p>}
            </div>
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
        <button className={`navButton ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
          <span className="material-symbols-outlined">chat</span>
          <span>Messages</span>
        </button>
      </nav>
    </div>
  );
}

export { ParentDashboard };
