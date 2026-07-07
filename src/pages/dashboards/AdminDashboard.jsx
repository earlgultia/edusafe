import React, { useMemo, useState } from 'react';
import { PeopleSheet } from '../../components/PeopleSheet.jsx';
import { ReportPreview } from '../../components/ReportPreview.jsx';
import { buildNotificationFeed } from '../../app/notificationUtils.js';
import { supabase } from '../../lib/supabaseClient.js';

function AdminDashboard({ data = {}, stats = {}, userName = 'Admin', setSheet, signOut, actions }) {
  const [activeTab, setActiveTab] = useState('home');
  const [announceForm, setAnnounceForm] = useState({ title: '', audience: 'All', body: '', priority: 'Normal' });
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const school = data.school || {};
  const schoolName = school.name || 'School profile not set';
  const schoolType = school.type || 'School type not set';
  const schoolYear = school.year || 'School year not set';
  const schoolContact = school.contact || 'Contact not set';
  const schoolAddress = school.address || 'Address not set';
  const totalStudents = stats.total ?? data.students?.length ?? 0;
  const present = stats.present ?? 0;
  const absent = stats.absent ?? 0;
  const visitors = stats.visitors ?? (data.visitors || []).filter((v) => v.status === 'On campus').length;
  const teachers = (data.teachers || []).length;
  const guardians = (data.guardians || []).length;
  const pendingForms = stats.pendingForms ?? (data.forms || []).reduce((sum, form) => sum + Math.max(form.total - form.submitted, 0), 0);
  const incidentsCount = (data.incidents || []).length;
  const clinicVisits = (data.clinic || []).length;
  const pendingPickups = (data.students || []).filter((student) => student.release === 'Waiting').length;
  const verifiedGuardians = (data.guardians || []).filter((guardian) => guardian.verified).length;

  const currentDate = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    []
  );
  const notificationCount = (data.announcements || []).length;

  const activity = useMemo(() => buildNotificationFeed(data).slice(0, 3), [data]);

  const recentStudents = (data.students || []).slice(0, 3);
  const recentTeachers = (data.teachers || []).slice(0, 3);
  const recentGuardians = (data.guardians || []).slice(0, 3);

  const openSheet = (name) => setSheet?.(name);

  const downloadFile = (filename, content, mime = 'text/csv') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportReport = (reportKey, format = 'csv') => {
    const rows = [];
    const addRowsFrom = (arr, cols) => {
      rows.push(cols.join(','));
      (arr || []).forEach((item) => {
        rows.push(cols.map((c) => (`"${(item[c] ?? '').toString().replace(/"/g, '""')}"`)).join(','));
      });
    };

    switch (reportKey) {
      case 'dailyAttendance':
        addRowsFrom(data.attendanceLog || [], ['date', 'time', 'student', 'studentId', 'status']);
        break;
      case 'monthlyAttendance':
        addRowsFrom(data.attendanceLog || [], ['date', 'time', 'student', 'studentId', 'status']);
        break;
      case 'studentAbsences':
        addRowsFrom((data.attendanceLog || []).filter((r) => r.status === 'Absent'), ['date', 'time', 'student', 'studentId', 'status']);
        break;
      case 'lateStudents':
        addRowsFrom((data.attendanceLog || []).filter((r) => r.status === 'Late'), ['date', 'time', 'student', 'studentId', 'status']);
        break;
      case 'visitorLogs':
        addRowsFrom(data.visitors || [], ['id', 'name', 'purpose', 'timeIn', 'timeOut', 'status']);
        break;
      case 'clinicReports':
        addRowsFrom(data.clinic || [], ['id', 'student', 'reason', 'time', 'notes']);
        break;
      case 'incidentReports':
        addRowsFrom(data.incidents || [], ['id', 'type', 'student', 'status', 'date']);
        break;
      case 'pickupLogs':
        addRowsFrom(data.pickupLog || [], ['id', 'student', 'guardian', 'status', 'time', 'date']);
        break;
      case 'lostFound':
        addRowsFrom(data.lostFound || [], ['id', 'item', 'foundBy', 'date', 'status']);
        break;
      default:
        addRowsFrom(data.attendanceLog || [], ['date', 'time', 'student', 'studentId', 'status']);
    }

    const content = rows.join('\n');
    const name = `${reportKey}-${new Date().toISOString().slice(0,10)}`;

    if (format === 'excel') {
      downloadFile(`${name}.csv`, content, 'text/csv');
    } else if (format === 'pdf') {
      const w = window.open('', '_blank');
      w.document.write(`<html><head><title>${name}</title></head><body><pre>${content.replace(/</g,'&lt;')}</pre></body></html>`);
      w.document.close();
      w.focus();
      w.print();
    } else {
      downloadFile(`${name}.csv`, content, 'text/csv');
    }
  };

  const prepareCSV = (reportKey) => {
    const rows = [];
    const addRowsFrom = (arr, cols) => {
      rows.push(cols.join(','));
      (arr || []).forEach((item) => {
        rows.push(cols.map((c) => (`"${(item[c] ?? '').toString().replace(/"/g, '""')}"`)).join(','));
      });
    };

    switch (reportKey) {
      case 'dailyAttendance':
      case 'monthlyAttendance':
        addRowsFrom(data.attendanceLog || [], ['date', 'time', 'student', 'studentId', 'status']);
        break;
      case 'studentAbsences':
        addRowsFrom((data.attendanceLog || []).filter((r) => r.status === 'Absent'), ['date', 'time', 'student', 'studentId', 'status']);
        break;
      case 'lateStudents':
        addRowsFrom((data.attendanceLog || []).filter((r) => r.status === 'Late'), ['date', 'time', 'student', 'studentId', 'status']);
        break;
      case 'visitorLogs':
        addRowsFrom(data.visitors || [], ['id', 'name', 'purpose', 'timeIn', 'timeOut', 'status']);
        break;
      case 'clinicReports':
        addRowsFrom(data.clinic || [], ['id', 'student', 'reason', 'time', 'notes']);
        break;
      case 'incidentReports':
        addRowsFrom(data.incidents || [], ['id', 'type', 'student', 'status', 'date']);
        break;
      case 'pickupLogs':
        addRowsFrom(data.pickupLog || [], ['id', 'student', 'guardian', 'status', 'time', 'date']);
        break;
      case 'lostFound':
        addRowsFrom(data.lostFound || [], ['id', 'item', 'foundBy', 'date', 'status']);
        break;
      default:
        addRowsFrom(data.attendanceLog || [], ['date', 'time', 'student', 'studentId', 'status']);
    }

    return rows.join('\n');
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCsv, setPreviewCsv] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewKey, setPreviewKey] = useState('');

  const openPreview = (key, title) => {
    setPreviewTitle(title);
    setPreviewCsv(prepareCSV(key));
    setPreviewKey(key);
    setPreviewOpen(true);
  };

  const fetchDevices = async () => {
    setLoadingDevices(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      try {
        const { data: sessionData } = await supabase?.auth?.getSession?.() || {};
        const token = sessionData?.session?.access_token || sessionData?.access_token || '';
        if (token) headers.Authorization = `Bearer ${token}`;
      } catch (e) {
        // ignore
      }
      const res = await fetch('/api/devices', { headers });
      const json = await res.json();
      if (json.ok) setDevices(json.devices || []);
    } catch (e) {
      // ignore
    }
    setLoadingDevices(false);
  };

  const removeDevice = async (token) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      try {
        const { data: sessionData } = await supabase?.auth?.getSession?.() || {};
        const at = sessionData?.session?.access_token || sessionData?.access_token || '';
        if (at) headers.Authorization = `Bearer ${at}`;
      } catch (e) {
        // ignore
      }
      await fetch('/api/devices', { method: 'DELETE', headers, body: JSON.stringify({ token }) });
      setDevices((d) => d.filter((it) => it.token !== token));
    } catch (e) {
      // ignore
    }
  };

  const exportSelected = () => {
    if (!selectedTokens.length) return;
    const selected = devices.filter((d) => selectedTokens.includes(d.token));
    const rows = ['email,role,token,addedAt'];
    selected.forEach((d) => {
      rows.push(`"${(d.email||'').replace(/"/g,'""')}","${(d.role||'').replace(/"/g,'""')}","${(d.token||'')}","${d.addedAt||''}"`);
    });
    const content = rows.join('\n');
    downloadFile(`devices-${new Date().toISOString().slice(0,10)}.csv`, content, 'text/csv');
  };

  const removeSelected = async () => {
    if (!selectedTokens.length) return;
    if (!confirm(`Remove ${selectedTokens.length} device(s)? This cannot be undone.`)) return;
    const headersBase = { 'Content-Type': 'application/json' };
    try {
      try {
        const { data: sessionData } = await supabase?.auth?.getSession?.() || {};
        const at = sessionData?.session?.access_token || sessionData?.access_token || '';
        if (at) headersBase.Authorization = `Bearer ${at}`;
      } catch (e) {
        // ignore
      }

      // Use bulk-delete endpoint when available for efficiency
      await fetch('/api/devices/bulk', { method: 'POST', headers: headersBase, body: JSON.stringify({ tokens: selectedTokens }) });
      setDevices((d) => d.filter((it) => !selectedTokens.includes(it.token)));
      setSelectedTokens([]);
    } catch (e) {
      // ignore
    }
  };

  const serverExportMock = (reportKey) => {
    // simulate server generation delay then trigger download
    setTimeout(() => {
      exportReport(reportKey, 'excel');
    }, 700);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'register':
        return (
          <section className="tabPage">
            <div className="sectionHeader registerHeader">
              <div>
                <p className="sectionLabel">Registration Center</p>
                <h2>Quick onboarding actions for your school community</h2>
              </div>
            </div>

            <div className="registerActionGrid">
              <button className="registerActionButton" type="button" onClick={() => openSheet('student')}>
                <span className="material-symbols-outlined actionIcon">school</span>
                <div>
                  <strong>Add Student</strong>
                  <small>Register a learner profile</small>
                </div>
              </button>
              <button className="registerActionButton" type="button" onClick={() => openSheet('teacher')}>
                <span className="material-symbols-outlined actionIcon">person_add</span>
                <div>
                  <strong>Add Teacher</strong>
                  <small>Create a faculty account</small>
                </div>
              </button>
              <button className="registerActionButton" type="button" onClick={() => openSheet('institutional_guardian')}>
                <span className="material-symbols-outlined actionIcon">domain</span>
                <div>
                  <strong>Add Institutional Guardian</strong>
                  <small>Register school-authorized pick-up personnel</small>
                </div>
              </button>
              <button className="registerActionButton" type="button" onClick={() => openSheet('guardian')}>
                <span className="material-symbols-outlined actionIcon">family_restroom</span>
                <div>
                  <strong>Add Guardian</strong>
                  <small>Link trusted contacts</small>
                </div>
              </button>
              <button className="registerActionButton" type="button" onClick={() => openSheet('school')}>
                <span className="material-symbols-outlined actionIcon">edit_location</span>
                <div>
                  <strong>Edit School</strong>
                  <small>Update campus details</small>
                </div>
              </button>
            </div>

            <section className="metricGrid">
              <article className="featureCard">
                <h3>School profile</h3>
                <p>{schoolName}</p>
              </article>
              <article className="featureCard">
                <h3>School year</h3>
                <p>{schoolYear}</p>
              </article>
              <article className="featureCard">
                <h3>Teacher accounts</h3>
                <p>{teachers} active teachers</p>
              </article>
              <article className="featureCard">
                <h3>Guardians</h3>
                <p>{guardians} trusted contacts</p>
              </article>
            </section>

            <section className="rosterGrid">
              <article className="featureCard rosterCard">
                <div className="rosterHeader">
                  <h3>Teacher roster</h3>
                  <span>{teachers} total</span>
                </div>
                <div className="rosterList">
                  {recentTeachers.map((teacher) => (
                    <div key={teacher.id} className="rosterItem">
                      <strong>{teacher.name}</strong>
                      <span>{teacher.position}</span>
                    </div>
                  ))}
                  {!recentTeachers.length && <p className="emptyText">No teacher accounts registered yet.</p>}
                </div>
              </article>
              <article className="featureCard rosterCard">
                <div className="rosterHeader">
                  <h3>Guardian registry</h3>
                  <span>{verifiedGuardians}/{guardians} verified</span>
                </div>
                <div className="rosterList">
                  {recentGuardians.map((guardian) => (
                    <div key={guardian.id} className="rosterItem">
                      <strong>{guardian.name}</strong>
                      <span>{guardian.relation}</span>
                    </div>
                  ))}
                  {!recentGuardians.length && <p className="emptyText">No guardians registered yet.</p>}
                </div>
              </article>
            </section>

            <section className="sectionHeader">
              <h2>Recent registrations</h2>
              <button className="textButton" type="button" onClick={() => setActiveTab('people')}>View All</button>
            </section>

            <div className="featureList">
              {recentStudents.map((student) => (
                <article key={student.id} className="reportRow">
                  <div>
                    <h3>{student.name}</h3>
                    <p>{student.grade} • {student.section}</p>
                  </div>
                  <span>{student.status}</span>
                </article>
              ))}
              {recentTeachers.map((teacher) => (
                <article key={teacher.id} className="reportRow">
                  <div>
                    <h3>{teacher.name}</h3>
                    <p>{teacher.position} • {teacher.advisory}</p>
                  </div>
                  <span>Teacher</span>
                </article>
              ))}
              {recentGuardians.map((guardian) => (
                <article key={guardian.id} className="reportRow">
                  <div>
                    <h3>{guardian.name}</h3>
                    <p>{guardian.relation} • {guardian.phone}</p>
                  </div>
                  <span>{guardian.verified ? 'Verified' : 'Pending'}</span>
                </article>
              ))}
            </div>
          </section>
        );
      case 'school':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>School Setup</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('school')}>Edit School Profile</button>
            </div>

            <section className="metricGrid">
              <article className="featureCard">
                <h3>School name</h3>
                <p>{schoolName}</p>
              </article>
              <article className="featureCard">
                <h3>School type</h3>
                <p>{schoolType}</p>
              </article>
              <article className="featureCard">
                <h3>School year</h3>
                <p>{schoolYear}</p>
              </article>
              <article className="featureCard">
                <h3>Campus contact</h3>
                <p>{schoolContact}</p>
              </article>
            </section>

            <section className="featureList">
              <article className="featureCard">
                <h3>Address</h3>
                <p>{schoolAddress}</p>
              </article>
              <article className="featureCard">
                <h3>Teacher accounts</h3>
                <p>{teachers} active teachers</p>
              </article>
              <article className="featureCard">
                <h3>Guardians</h3>
                <p>{guardians} trusted contacts</p>
              </article>
              <article className="featureCard">
                <h3>Enrolled students</h3>
                <p>{totalStudents}</p>
              </article>
            </section>
          </section>
        );
      case 'reports':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>Safety Operations</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('visitor')}>New Visitor</button>
            </div>

            <section className="metricGrid">
              <article className="featureCard">
                <h3>Visitors on campus</h3>
                <p>{visitors} active visitor(s)</p>
              </article>
              <article className="featureCard">
                <h3>Clinic records</h3>
                <p>{clinicVisits} logged today</p>
              </article>
              <article className="featureCard">
                <h3>Open incidents</h3>
                <p>{incidentsCount} reports</p>
              </article>
              <article className="featureCard">
                <h3>Pickup queue</h3>
                <p>{pendingPickups} awaiting release</p>
              </article>
            </section>

            <section className="workflowList">
              <button type="button" className="workflowCard" onClick={() => openSheet('incident')}>
                <div>
                  <h3>Incident Report</h3>
                  <p>Log a safety incident.</p>
                </div>
                <small>Report</small>
              </button>
              <button type="button" className="workflowCard" onClick={() => openSheet('clinic')}>
                <div>
                  <h3>Clinic Record</h3>
                  <p>Register a student health visit.</p>
                </div>
                <small>Health</small>
              </button>
              <button type="button" className="workflowCard" onClick={() => openSheet('release')}>
                <div>
                  <h3>Guardian Pickup</h3>
                  <p>Verify guardian release with QR.</p>
                </div>
                <small>Release</small>
              </button>
              <button type="button" className="workflowCard" onClick={() => openSheet('emergency')}>
                <div>
                  <h3>Emergency Alert</h3>
                  <p>Broadcast a school-wide notification.</p>
                </div>
                <small>Urgent</small>
              </button>
            </section>

            <section className="sectionHeader">
              <h2>Recent logs</h2>
              <button className="textButton" type="button">Open Log</button>
            </section>

            <div className="featureList">
              {(data.visitors || []).slice(0, 2).map((visitor) => (
                <article key={visitor.id} className="reportRow">
                  <div>
                    <h3>{visitor.name}</h3>
                    <p>{visitor.purpose}</p>
                  </div>
                  <span>{visitor.status}</span>
                </article>
              ))}
              {(data.incidents || []).slice(0, 2).map((incident) => (
                <article key={incident.id} className="reportRow">
                  <div>
                    <h3>{incident.type}</h3>
                    <p>{incident.student}</p>
                  </div>
                  <span>{incident.status || 'Open'}</span>
                </article>
              ))}
              {!(data.visitors || []).length && !(data.incidents || []).length && <p className="emptyText">No safety logs yet.</p>}
            </div>

            <section className="sectionHeader">
              <h2>Reports</h2>
            </section>

            <section className="reportGrid">
              <button type="button" className="reportCard" onClick={() => openPreview('dailyAttendance', 'Daily Attendance')}>
                <h3>Daily Attendance</h3>
                <p>Summary of student attendance for today.</p>
              </button>
              <button type="button" className="reportCard" onClick={() => openPreview('monthlyAttendance', 'Monthly Attendance')}>
                <h3>Monthly Attendance</h3>
                <p>Attendance trends and monthly totals.</p>
              </button>
              <button type="button" className="reportCard" onClick={() => openPreview('studentAbsences', 'Student Absences')}>
                <h3>Student Absences</h3>
                <p>Absence records by student and date.</p>
              </button>
              <button type="button" className="reportCard" onClick={() => openPreview('lateStudents', 'Late Students')}>
                <h3>Late Students</h3>
                <p>Students who arrived late today.</p>
              </button>
              <button type="button" className="reportCard" onClick={() => openPreview('visitorLogs', 'Visitor Logs')}>
                <h3>Visitor Logs</h3>
                <p>All campus visitor entries and exits.</p>
              </button>
              <button type="button" className="reportCard" onClick={() => openPreview('clinicReports', 'Clinic Reports')}>
                <h3>Clinic Reports</h3>
                <p>Health visits and clinic summaries.</p>
              </button>
              <button type="button" className="reportCard" onClick={() => openPreview('incidentReports', 'Incident Reports')}>
                <h3>Incident Reports</h3>
                <p>Safety incidents with status and follow-up.</p>
              </button>
              <button type="button" className="reportCard" onClick={() => openPreview('pickupLogs', 'Pickup Logs')}>
                <h3>Pickup Logs</h3>
                <p>Guardian pickup and release history.</p>
              </button>
              <button type="button" className="reportCard" onClick={() => openPreview('lostFound', 'Lost & Found Reports')}>
                <h3>Lost & Found Reports</h3>
                <p>Missing items and recovery records.</p>
              </button>
            </section>

            <section className="sectionHeader">
              <h2>Export options</h2>
              <div>
                <button className="smallBtn" type="button" onClick={() => exportReport('monthlyAttendance', 'pdf')}>PDF</button>
                <button className="smallBtn" type="button" onClick={() => exportReport('monthlyAttendance', 'excel')}>Excel</button>
              </div>
            </section>
          </section>
        );
      case 'people':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>People registry</h2>
            </div>
            <PeopleSheet data={data} />
          </section>
        );
      case 'profile':
        return (
          <section className="tabPage profilePage">
            <div className="profileCard">
              <div className="profileAvatar">{userName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
              <div>
                <p className="adminDate">Administrator</p>
                <h2>{userName}</h2>
                <p className="metricText">admin@edusafe.ph</p>
              </div>
            </div>
            <div className="profileDetails">
              <div>
                <p className="metricText">School</p>
                <strong>{schoolName}</strong>
              </div>
              <div>
                <p className="metricText">Role</p>
                <strong>Principal / System Administrator</strong>
              </div>
              <div>
                <p className="metricText">School year</p>
                <strong>{schoolYear}</strong>
              </div>
              <div>
                <p className="metricText">Verified guardians</p>
                <strong>{verifiedGuardians}</strong>
              </div>
            </div>
          </section>
        );
      default:
        return (
          <>
            <section className="sectionTitleBlock sectionTitleRow">
              <div>
                <span>Dashboard overview</span>
                <h2>{schoolName}</h2>
                <p className="metricText">{currentDate}</p>
              </div>
              <div className="notificationBadge">
                <p className="notificationLabel">School-wide notifications</p>
                <p className="overviewValue">{notificationCount}</p>
              </div>
            </section>

            <section className="overviewRow">
              <article className="overviewCard">
                <div className="overviewCardHeader">
                  <span className="material-symbols-outlined overviewIcon">groups</span>
                  <p className="overviewLabel">Visitors on campus</p>
                </div>
                <p className="overviewValue">{visitors}</p>
              </article>
              <article className="overviewCard">
                <div className="overviewCardHeader">
                  <span className="material-symbols-outlined overviewIcon">article</span>
                  <p className="overviewLabel">Pending forms</p>
                </div>
                <p className="overviewValue">{pendingForms}</p>
              </article>
              <article className="overviewCard">
                <div className="overviewCardHeader">
                  <span className="material-symbols-outlined overviewIcon">access_time</span>
                  <p className="overviewLabel">Pickup queue</p>
                </div>
                <p className="overviewValue">{pendingPickups}</p>
              </article>
              <article className="overviewCard">
                <div className="overviewCardHeader">
                  <span className="material-symbols-outlined overviewIcon">emoji_people</span>
                  <p className="overviewLabel">Active teachers</p>
                </div>
                <p className="overviewValue">{teachers}</p>
              </article>
            </section>

            <section className="metricGrid">
              <article className="heroCard">
                <div className="heroCardHeader">
                  <span className="material-symbols-outlined heroIcon">school</span>
                  <span className="badge">STUDENTS</span>
                </div>
                <div>
                  <p className="heroValue">{totalStudents.toLocaleString()}</p>
                  <p className="heroLabel">Total Enrolled</p>
                </div>
              </article>
              <article className="metricCard presentCard">
                <div className="metricCardHeader">
                  <span className="material-symbols-outlined metricIcon">check_circle</span>
                  <span className="metricBadge">Present</span>
                </div>
                <div>
                  <p className="metricValue">{present.toLocaleString()}</p>
                  <p className="metricText">Today</p>
                </div>
              </article>
              <article className="metricCard lightCard">
                <div className="metricCardHeader">
                  <span className="material-symbols-outlined metricIcon muted">person_off</span>
                  <span className="metricBadge alertBadge">Absent</span>
                </div>
                <div>
                  <p className="metricValue">{absent.toLocaleString()}</p>
                  <p className="metricText">Today</p>
                </div>
              </article>
              <article className="metricCard visitorCard">
                <div className="metricCardHeader">
                  <span className="material-symbols-outlined metricIcon">assignment_ind</span>
                  <span className="metricBadge liveBadge">Live</span>
                </div>
                <div>
                  <p className="metricValue">{visitors}</p>
                  <p className="metricText">On Campus</p>
                </div>
              </article>
            </section>

            <section className="metricGrid">
              <article className="summaryCard">
                <h3>Active Teachers</h3>
                <p>{teachers}</p>
              </article>
              <article className="summaryCard">
                <h3>Clinic Visits</h3>
                <p>{clinicVisits}</p>
              </article>
              <article className="summaryCard">
                <h3>Pending Digital Forms</h3>
                <p>{pendingForms}</p>
              </article>
              <article className="summaryCard">
                <h3>Guardian Pickup Queue</h3>
                <p>{pendingPickups}</p>
              </article>
            </section>

            <section className="sectionHeader quickActionsHeader">
              <div className="sectionHeaderCopy">
                <h2>Quick Actions</h2>
              </div>
              <div className="quickActionsControls">
                <button className="smallBtn" type="button" onClick={() => openSheet('announcement')}>Publish Notice</button>
                <div className="quickActionsCompose">
                  <input className="quickActionInput" placeholder="Title" value={announceForm.title} onChange={(e) => setAnnounceForm({ ...announceForm, title: e.target.value })} />
                  <select className="quickActionSelect" value={announceForm.audience} onChange={(e) => setAnnounceForm({ ...announceForm, audience: e.target.value })}>
                    <option>All</option>
                    <option>Parent</option>
                    <option>Teacher</option>
                    <option>Guard</option>
                    <option>Admin</option>
                  </select>
                  <button className="smallBtn quickActionSend" type="button" onClick={() => {
                    if (!announceForm.title || !announceForm.body) {
                      // open the announcement sheet for full compose if missing
                      openSheet('announcement');
                      return;
                    }
                    actions.addAnnouncement({ title: announceForm.title, audience: announceForm.audience, body: announceForm.body, priority: announceForm.priority });
                    setAnnounceForm({ title: '', audience: 'All', body: '', priority: 'Normal' });
                  }}>Send</button>
                </div>
              </div>
            </section>

            <section className="workflowList">
              <button type="button" className="workflowCard" onClick={() => openSheet('student')}>
                <div>
                  <h3>Add Student</h3>
                  <p>Register a new learner profile.</p>
                </div>
                <small>New</small>
              </button>
              <button type="button" className="workflowCard" onClick={() => openSheet('teacher')}>
                <div>
                  <h3>Add Teacher</h3>
                  <p>Create a teacher profile.</p>
                </div>
                <small>Staff</small>
              </button>
              <button type="button" className="workflowCard" onClick={() => openSheet('guardian')}>
                <div>
                  <h3>Add Guardian</h3>
                  <p>Register a guardian and link to a student.</p>
                </div>
                <small>Guard</small>
              </button>
              <button type="button" className="workflowCard" onClick={() => openSheet('visitor')}>
                <div>
                  <h3>New Visitor</h3>
                  <p>Log guest arrival and badge details.</p>
                </div>
                <small>Entry</small>
              </button>
              <button type="button" className="workflowCard" onClick={() => openSheet('incident')}>
                <div>
                  <h3>Incident Report</h3>
                  <p>Capture a safety incident.</p>
                </div>
                <small>Alert</small>
              </button>
              <button type="button" className="workflowCard" onClick={() => openSheet('emergency')}>
                <div>
                  <h3>Emergency Alert</h3>
                  <p>Broadcast a school-wide notice.</p>
                </div>
                <small>Urgent</small>
              </button>
            </section>

            <section className="activityHeader">
              <h2>Recent Notifications</h2>
              <button className="textButton" type="button">View All</button>
            </section>

            <section className="activityList">
              {activity.map((item) => (
                <article key={item.id} className={`activityItem ${item.tone === 'alert' ? 'activityAlert' : 'activityNormal'}`}>
                  <div className={`activityIcon ${item.tone === 'alert' ? 'alertIcon' : 'normalIcon'}`}>
                    <span className="material-symbols-outlined">
                      {item.tone === 'alert' ? 'emergency_home' : 'report_problem'}
                    </span>
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
              {!activity.length && <p className="emptyText">No recent notifications yet.</p>}
            </section>
            <section className="sectionHeader" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0 }}>Registered Devices</h2>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{devices.length} device(s) registered</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={selectedTokens.length === devices.length && devices.length > 0} onChange={(e) => {
                    if (e.target.checked) setSelectedTokens(devices.map((d) => d.token));
                    else setSelectedTokens([]);
                  }} />
                  <span style={{ fontSize: 13 }}>Select all</span>
                </label>
                <button className="smallBtn" type="button" onClick={() => exportSelected()} disabled={!selectedTokens.length}>Export</button>
                <button className="smallBtn" type="button" onClick={() => removeSelected()} disabled={!selectedTokens.length}>Remove selected</button>
                <button className="smallBtn" type="button" onClick={() => fetchDevices()}>Refresh</button>
              </div>
            </section>
            <section className="activityList">
              {loadingDevices && <p>Loading devices...</p>}
              {!loadingDevices && devices.length === 0 && <p className="emptyText">No registered devices.</p>}
              {!loadingDevices && devices.map((d) => (
                <article key={d.token} className="activityItem">
                  <div className="activityBody" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <input type="checkbox" checked={selectedTokens.includes(d.token)} onChange={(e) => {
                        if (e.target.checked) setSelectedTokens((s) => Array.from(new Set([...s, d.token])));
                        else setSelectedTokens((s) => s.filter((t) => t !== d.token));
                      }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{d.email || 'Unknown'}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{d.role || 'Unknown role'} • Added {d.addedAt ? new Date(d.addedAt).toLocaleString() : 'unknown'}</div>
                      </div>
                    </div>
                    <div>
                      <button className="smallBtn" type="button" onClick={() => removeDevice(d.token)}>Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
            <section className="sectionHeader">
              <h2>Lost & Found — Claims</h2>
              <p className="sectionNote">Review claims and verify returned items.</p>
            </section>
            <div className="featureList">
              {(data.lostFound || []).map((it) => (
                <article key={it.id} className="reportRow">
                  <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                    {it.photo && <img src={it.photo} alt={it.item || 'found item'} className="lostThumb" />}
                    <div>
                      <h3>{it.item || it.description || 'Unnamed item'}</h3>
                      <p>{it.location} · {it.date}</p>
                      {it.description && <small>{it.description}</small>}
                      {it.claim && <div className="muted">Claim by: {it.claim.claimant} · {it.claim.contact}</div>}
                    </div>
                  </div>
                  <div>
                    <span>{it.status}</span>
                    {actions && actions.verifyReturn && it.status !== 'Returned' && (
                      <button className="smallBtn" type="button" onClick={async () => {
                        try {
                          const res = await fetch(`/api/lostfound/${it.id}/verify`, { method: 'POST' });
                          if (res.ok) {
                            actions.verifyReturn(it.id, userName);
                            if (window.showToast) window.showToast('Marked returned');
                          } else {
                            actions.verifyReturn(it.id, userName);
                            if (window.showToast) window.showToast('Marked returned (local)');
                          }
                        } catch (e) {
                          actions.verifyReturn(it.id, userName);
                          if (window.showToast) window.showToast('Marked returned (local)');
                        }
                      }}>Verify Return</button>
                    )}
                  </div>
                </article>
              ))}
              {!(data.lostFound || []).length && <p className="emptyText">No lost & found items.</p>}
            </div>
          </>
        );
    }
  };

  return (
    <div className="adminPage">
      <main className="adminContent">
        {renderTabContent()}
      </main>

      <ReportPreview
        open={previewOpen}
        title={previewTitle}
        csv={previewCsv}
        onClose={() => setPreviewOpen(false)}
        onDownloadCsv={() => downloadFile(`${previewKey}-${new Date().toISOString().slice(0,10)}.csv`, previewCsv, 'text/csv')}
        onPrint={() => exportReport(previewKey, 'pdf')}
        onServerExport={() => serverExportMock(previewKey)}
      />

      <nav className="bottomNav">
        <button className={`navButton ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <span className="material-symbols-outlined">home</span>
          <span>Home</span>
        </button>
        <button className={`navButton ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
          <span className="material-symbols-outlined">groups</span>
          <span>Register</span>
        </button>
        <button className={`navButton ${activeTab === 'school' ? 'active' : ''}`} onClick={() => setActiveTab('school')}>
          <span className="material-symbols-outlined">school</span>
          <span>School</span>
        </button>
        <button className={`navButton ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          <span className="material-symbols-outlined">shield</span>
          <span>Safety</span>
        </button>
        <button className={`navButton ${activeTab === 'people' ? 'active' : ''}`} onClick={() => setActiveTab('people')}>
          <span className="material-symbols-outlined">people</span>
          <span>People</span>
        </button>
        <button className={`navButton ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <span className="material-symbols-outlined">person</span>
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export { AdminDashboard };
