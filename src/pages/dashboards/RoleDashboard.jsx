import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AdminDashboard } from './AdminDashboard.jsx';
import { ParentDashboard } from './ParentDashboard.jsx';
import { PeopleSheet } from '../../components/PeopleSheet.jsx';

function TeacherDashboard({ data = {}, stats = {}, userName = 'Teacher', setSheet, actions, signOut }) {
  const [activeTab, setActiveTab] = useState('attendance');
  const students = data.students || [];
  const announcements = data.announcements || [];
  const incidents = data.incidents || [];
  const forms = data.forms || [];
  const events = data.events || [];
  const totalStudents = students.length;
  const present = students.filter((student) => student.status === 'Present').length;
  const absent = students.filter((student) => student.status === 'Absent').length;
  const late = students.filter((student) => student.status === 'Late').length;
  const notReleased = students.filter((student) => student.release === 'Waiting').length;
  const pendingForms = stats.pendingForms ?? forms.reduce((sum, form) => sum + Math.max(form.total - form.submitted, 0), 0);
  const clinicReferrals = (data.clinic || []).length;
  const incidentCount = incidents.length;
  const upcomingEvents = events.slice(0, 3);
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

  const attendanceStatusClass = (status) => {
    switch (status) {
      case 'Present': return 'statusPill present';
      case 'Absent': return 'statusPill absent';
      case 'Late': return 'statusPill late';
      case 'Excused': return 'statusPill excused';
      default: return 'statusPill pending';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'attendance':
        return (
          <section className="tabPage attendanceTab">
            <div className="attendanceHeading">
              <div>
                <span className="sectionSubtitle">Daily roll</span>
                <h2>Attendance</h2>
                <p className="sectionIntro">Tap Mark Attendance to start today’s roll and update parents instantly.</p>
              </div>
              <button className="smallBtn primaryBtn" type="button" onClick={() => openSheet('attendance')}>Mark Attendance</button>
            </div>
            <section className="metricGrid attendanceMetrics">
              <article className="summaryCard presentCard">
                <h3>Present</h3>
                <p>{present}</p>
              </article>
              <article className="summaryCard">
                <h3>Absent</h3>
                <p>{absent}</p>
              </article>
              <article className="summaryCard">
                <h3>Late</h3>
                <p>{late}</p>
              </article>
              <article className="summaryCard">
                <h3>Not marked</h3>
                <p>{Math.max(totalStudents - (present + absent + late), 0)}</p>
              </article>
            </section>
            <section className="attendanceCard">
              <div className="attendanceCardHeader">
                <div>
                  <h3>Student attendance preview</h3>
                  <p>Review the first six students and tap Mark Attendance to update each one.</p>
                </div>
                <span className="badge">{totalStudents} students</span>
              </div>
              {(students || []).slice(0, 6).map((student) => (
                <article key={student.id} className="reportRow">
                  <div>
                    <h3>{student.name}</h3>
                    <p>{student.grade || 'Student'} · {student.section || 'Section'}</p>
                  </div>
                  <span className={attendanceStatusClass(student.status)}>{student.status || 'Pending'}</span>
                </article>
              ))}
              {!students.length && <p className="emptyText">No students available for attendance.</p>}
            </section>
          </section>
        );
      case 'people':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>People</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('teacher')}>Add Teacher</button>
            </div>
            <PeopleSheet data={data} actions={actions} />
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
      case 'events':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>School events</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('event')}>Add Event</button>
            </div>
            <div className="featureList">
              {events.map((event) => (
                <article key={event.id} className="reportRow">
                  <div>
                    <h3>{event.title}</h3>
                    <p>{event.date} · {event.location || 'Campus'}</p>
                    {event.details && <small>{event.details}</small>}
                  </div>
                  <span>{event.location || 'Campus'}</span>
                </article>
              ))}
              {!events.length && <p className="emptyText">No events scheduled yet.</p>}
            </div>
            <button className="smallBtn" type="button" onClick={() => setActiveTab('home')}>Back to dashboard</button>
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
      case 'lost':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>Lost & Found</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('lost')}>Report Found Item</button>
            </div>
            <section className="featureList">
              {(data.lostFound || []).map((item) => (
                <article key={item.id} className="reportRow">
                  <div>
                    <h3>{item.item || item.description || 'Lost item'}</h3>
                    <p>{item.location || 'Location unknown'} · {new Date(item.createdAt || item.date || Date.now()).toLocaleDateString()}</p>
                    {item.foundBy && <small>Found by {item.foundBy}</small>}
                  </div>
                  <span>{item.status}</span>
                </article>
              ))}
              {!(data.lostFound || []).length && <p className="emptyText">No lost & found reports yet.</p>}
            </section>
          </section>
        );
      default:
        return (
          <section className="tabPage">
            <section className="sectionTitleBlock sectionTitleRow">
              <div>
                <span>Teacher workspace</span>
                <h2>Welcome, {userName}</h2>
              </div>
            </section>

            <section className="overviewRow">
              <article className="overviewCard">
                <div className="overviewCardHeader">
                  <span className="material-symbols-outlined overviewIcon">task_alt</span>
                  <p className="overviewLabel">Today's attendance</p>
                </div>
                <p className="overviewValue">{present + absent + late}</p>
              </article>
              <article className="overviewCard">
                <div className="overviewCardHeader">
                  <span className="material-symbols-outlined overviewIcon">person_off</span>
                  <p className="overviewLabel">Absent students</p>
                </div>
                <p className="overviewValue">{absent}</p>
              </article>
              <article className="overviewCard">
                <div className="overviewCardHeader">
                  <span className="material-symbols-outlined overviewIcon">inventory_2</span>
                  <p className="overviewLabel">Not yet released</p>
                </div>
                <p className="overviewValue">{notReleased}</p>
              </article>
              <article className="overviewCard">
                <div className="overviewCardHeader">
                  <span className="material-symbols-outlined overviewIcon">campaign</span>
                  <p className="overviewLabel">Announcements</p>
                </div>
                <p className="overviewValue">{announcements.length}</p>
              </article>
            </section>

            <section className="metricGrid">
              <article className="summaryCard">
                <h3>Pending forms</h3>
                <p>{pendingForms}</p>
              </article>
              <article className="summaryCard">
                <h3>Recent incidents</h3>
                <p>{incidentCount}</p>
              </article>
              <article className="summaryCard">
                <h3>Clinic referrals</h3>
                <p>{clinicReferrals}</p>
              </article>
              <article className="summaryCard">
                <h3>Upcoming events</h3>
                <p>{upcomingEvents.length}</p>
              </article>
            </section>

            <section className="sectionHeader">
              <h2>Teacher actions</h2>
              <div className="sectionActions">
                <button className="smallBtn" type="button" onClick={() => openSheet('attendance')}>Mark Attendance</button>
                <button className="smallBtn" type="button" onClick={() => openSheet('event')}>Add Event</button>
                <button className="smallBtn" type="button" onClick={() => openSheet('lost')}>File Lost Item</button>
              </div>
            </section>
            <section className="sectionHeader">
              <h2>Upcoming school events</h2>
            </section>
            <section className="featureList">
              {upcomingEvents.map((event) => (
                <article key={event.id} className="reportRow">
                  <div>
                    <h3>{event.title}</h3>
                    <p>{event.date}</p>
                  </div>
                  <span>{event.location || 'Campus'}</span>
                </article>
              ))}
              {!upcomingEvents.length && <p className="emptyText">No upcoming events yet.</p>}
            </section>

            <section className="sectionHeader">
              <h2>Recent updates</h2>
              <button className="textButton" type="button" onClick={() => setActiveTab('comms')}>View All</button>
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
              {!activity.length && <p className="emptyText">No recent updates yet.</p>}
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
        <button className={`navButton ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
          <span className="material-symbols-outlined">check_circle</span>
          <span>Attendance</span>
        </button>
        <button className={`navButton ${activeTab === 'people' ? 'active' : ''}`} onClick={() => setActiveTab('people')}>
          <span className="material-symbols-outlined">people</span>
          <span>People</span>
        </button>
        <button className={`navButton ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
          <span className="material-symbols-outlined">event</span>
          <span>Events</span>
        </button>
        <button className={`navButton ${activeTab === 'lost' ? 'active' : ''}`} onClick={() => setActiveTab('lost')}>
          <span className="material-symbols-outlined">inventory_2</span>
          <span>Lost</span>
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
  const [scanActive, setScanActive] = useState(false);
  const [scanMessage, setScanMessage] = useState('QR verification ready');
  const [scanError, setScanError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const visitors = (data.visitors || []).filter((v) => v.status === 'On campus').length;
  const studentWaiting = (data.students || []).filter((student) => student.release === 'Waiting').length;
  const recentVisitors = (data.visitors || []).slice(0, 3);
  const openSheet = (sheet) => setSheet?.(sheet);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      canvasRef.current.width = 0;
      canvasRef.current.height = 0;
    }
    setScanActive(false);
    setScanError('');
    setScanMessage('QR verification ready');
  };

  const checkCameraPermission = async () => {
    if (!navigator.permissions?.query) return null;
    try {
      const status = await navigator.permissions.query({ name: 'camera' });
      return status.state;
    } catch (error) {
      return null;
    }
  };

  const startScan = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanError('Camera access is not supported on this device.');
      return;
    }

    const permissionState = await checkCameraPermission();
    if (permissionState === 'denied') {
      setScanError('Camera permission is denied. Please allow camera access in your phone settings.');
      setScanMessage('QR verification ready');
      return;
    }

    try {
      setScanError('');
      setScanMessage('Requesting camera permission…');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanActive(true);
      setScanMessage('Point the camera at a parent QR code.');
    } catch (error) {
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setScanError('Camera access was denied. Please allow camera permission when prompted.');
      } else if (error?.name === 'NotFoundError') {
        setScanError('No camera was found on this device.');
      } else {
        setScanError('Camera permission was denied or is unavailable.');
      }
      setScanMessage('QR verification ready');
    }
  };

  useEffect(() => {
    if (!scanActive || !videoRef.current || !canvasRef.current) return;

    let cancelled = false;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const tick = async () => {
      if (cancelled || !scanActive) return;

      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await detector.detect(canvas);
          if (!cancelled && barcodes?.length) {
            setScanMessage(`Verified QR: ${barcodes[0].rawValue}`);
            stopScan();
            return;
          }
        } catch (error) {
          if (!cancelled) {
            setScanError('Unable to read QR codes from this camera.');
          }
        }
      } else if (!cancelled) {
        setScanError('QR scanning is not supported in this browser.');
      }

      if (!cancelled && scanActive) {
        setTimeout(tick, 250);
      }
    };

    tick();

    return () => {
      cancelled = true;
    };
  }, [scanActive]);

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
              <article className="featureCard" onClick={scanActive ? stopScan : startScan} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); (scanActive ? stopScan : startScan)(); } }}>
                <h3>Scans</h3>
                <p>{scanMessage}</p>
                {scanError ? <p className="authFeedback">{scanError}</p> : null}
                {scanActive ? (
                  <div className="scanPreviewWrap">
                    <video ref={videoRef} className="scanVideo" playsInline muted autoPlay />
                    <canvas ref={canvasRef} className="scanCanvas" />
                    <button className="backChip" type="button" onClick={(event) => { event.stopPropagation(); stopScan(); }}>Stop</button>
                  </div>
                ) : null}
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

function RoleDashboard({ role, data, stats, userName, auth, setAuth, setSheet, signOut, actions }) {
  switch (role) {
    case 'Teacher':
      return <TeacherDashboard data={data} stats={stats} userName={userName} setSheet={setSheet} signOut={signOut} actions={actions} />;
    case 'Parent':
      return <ParentDashboard data={data} userName={userName} auth={auth} setAuth={setAuth} setSheet={setSheet} signOut={signOut} actions={actions} />;
    case 'Guard':
      return <GuardDashboard data={data} userName={userName} setSheet={setSheet} signOut={signOut} />;
    case 'Nurse':
      return <NurseDashboard data={data} userName={userName} setSheet={setSheet} signOut={signOut} />;
    case 'Admin':
    default:
      return <AdminDashboard data={data} stats={stats} userName={userName} setSheet={setSheet} signOut={signOut} actions={actions} />;
  }
}

export { RoleDashboard };
