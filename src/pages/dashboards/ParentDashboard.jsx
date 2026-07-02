import React, { useState } from 'react';
import { CalendarView } from '../../components/CalendarView.jsx';

function ParentDashboard({ data = {}, userName = 'Parent', setSheet }) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const announcements = data.announcements || [];
  const students = data.students || [];
  const currentStudentId = selectedStudentId || students[0]?.id || '';
  const selectedStudent = students.find((child) => child.id === currentStudentId) || {};
  const guardians = data.guardians || [];
  const childGuardians = guardians.filter((guardian) => guardian.studentId === selectedStudent.id);
  const attendanceLog = data.attendanceLog || [];
  const studentAttendance = attendanceLog.filter((entry) => entry.studentId === selectedStudent.id);
  const pickupHistory = (data.pickupLog || []).filter((entry) => entry.studentId === selectedStudent.id);
  const clinicVisits = (data.clinic || []).filter((entry) => entry.studentId === selectedStudent.id || entry.student === selectedStudent.name);
  const incidentReports = (data.incidents || []).filter((entry) => entry.studentId === selectedStudent.id || entry.student === selectedStudent.name);
  const emergencyAlerts = data.emergency || [];
  const calendarEvents = data.events || [];
  const present = studentAttendance.filter((entry) => entry.status === 'Present').length;
  const absent = studentAttendance.filter((entry) => entry.status === 'Absent').length;
  const late = studentAttendance.filter((entry) => entry.status === 'Late').length;
  const excused = studentAttendance.filter((entry) => entry.status === 'Excused').length;
  const attendanceSummary = studentAttendance.length
    ? `${present} present · ${absent} absent · ${late} late · ${excused} excused`
    : 'Attendance data not available yet';
  const pendingForms = data.forms ? data.forms.reduce((sum, form) => sum + Math.max(form.total - form.submitted, 0), 0) : 0;
  const hasMultipleChildren = students.length > 1;
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
      case 'calendar':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>School calendar</h2>
            </div>
            <CalendarView events={calendarEvents} />
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

            {hasMultipleChildren && (
              <section className="sectionHeader">
                <div>
                  <p className="sectionLabel">Switch child profile</p>
                  <select className="childSelect" value={currentStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
                    {students.map((child) => (
                      <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                  </select>
                </div>
              </section>
            )}

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
                  <strong>Guardian passes</strong>
                  <small>View or share verified guardian QR passes.</small>
                </div>
              </button>
              <button type="button" className="actionCard" onClick={() => setActiveTab('messages')}>
                <span className="material-symbols-outlined">announcement</span>
                <div>
                  <strong>School announcements</strong>
                  <small>See the latest notices and alerts.</small>
                </div>
              </button>
                <button type="button" className="actionCard" onClick={() => setActiveTab('calendar')}>
                <span className="material-symbols-outlined">calendar_month</span>
                <div>
                  <strong>School calendar</strong>
                  <small>Check upcoming events and school days.</small>
                </div>
              </button>
            </section>

            <section className="metricGrid">
              <article className="featureCard">
                <h3>{selectedStudent.name || 'Linked child'}</h3>
                <p>{studentAttendance.length ? `${studentAttendance.length} attendance records` : 'No attendance recorded yet'}</p>
              </article>
              <article className="featureCard">
                <h3>Pickup history</h3>
                <p>{pickupHistory.length} record(s)</p>
              </article>
              <article className="featureCard">
                <h3>Clinic visits</h3>
                <p>{clinicVisits.length} logged</p>
              </article>
              <article className="featureCard">
                <h3>Incident reports</h3>
                <p>{incidentReports.length} item(s)</p>
              </article>
              <article className="featureCard">
                <h3>Digital forms</h3>
                <p>{pendingForms} pending</p>
              </article>
            </section>

            <section className="sectionHeader">
              <h2>Attendance calendar</h2>
              <button className="smallBtn" type="button" onClick={() => setActiveTab('calendar')}>View calendar</button>
            </section>
            <div className="timeline">
              {studentAttendance.slice(-4).map((entry) => (
                <article key={entry.id || `${entry.date}-${entry.status}`} className="row">
                  <div>
                    <h3>{entry.date || 'Date unknown'}</h3>
                    <p>{entry.status}</p>
                  </div>
                  <span className="status">{entry.status}</span>
                </article>
              ))}
              {!studentAttendance.length && <p className="emptyText">No attendance entries for this child yet.</p>}
            </div>

            <section className="sectionHeader">
              <h2>Pickup history</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('guardian')}>Manage guardians</button>
            </section>
            <div className="featureList">
              {pickupHistory.slice(0, 4).map((entry) => (
                <article key={entry.id} className="reportRow">
                  <div>
                    <h3>{entry.student || selectedStudent.name}</h3>
                    <p>{entry.date || 'Today'} · {entry.status}</p>
                  </div>
                  <span>{entry.time || ''}</span>
                </article>
              ))}
              {!pickupHistory.length && <p className="emptyText">No pickup history yet.</p>}
            </div>

            <section className="sectionHeader">
              <h2>Health & incident reports</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('clinic')}>New clinic report</button>
            </section>
            <div className="featureList">
              {clinicVisits.slice(0, 2).map((visit) => (
                <article key={visit.id} className="reportRow">
                  <div>
                    <h3>{visit.reason}</h3>
                    <p>{visit.date || visit.time || 'Clinic visit'}</p>
                  </div>
                  <span>{visit.temp || 'Details'}</span>
                </article>
              ))}
              {incidentReports.slice(0, 2).map((incident) => (
                <article key={incident.id} className="reportRow">
                  <div>
                    <h3>{incident.type}</h3>
                    <p>{incident.description}</p>
                  </div>
                  <span>{incident.status || 'Reported'}</span>
                </article>
              ))}
              {!clinicVisits.length && !incidentReports.length && <p className="emptyText">No clinic or incident reports for this child.</p>}
            </div>

            <section className="sectionHeader">
              <h2>Emergency alerts</h2>
            </section>
            <div className="featureList">
              {emergencyAlerts.slice(0, 3).map((alert) => (
                <article key={alert.id} className="reportRow">
                  <div>
                    <h3>{alert.type}</h3>
                    <p>{alert.time}</p>
                  </div>
                  <span>Alert</span>
                </article>
              ))}
              {!emergencyAlerts.length && <p className="emptyText">No emergency alerts.</p>}
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
