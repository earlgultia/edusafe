import React, { useMemo, useState } from 'react';
import { PeopleSheet } from '../../components/PeopleSheet.jsx';

function AdminDashboard({ data = {}, stats = {}, userName = 'Admin', setSheet, signOut }) {
  const [activeTab, setActiveTab] = useState('home');
  const school = data.school || {};
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

  const activity = useMemo(() => {
    const announcements = (data.announcements || []).slice(0, 2).map((item) => ({
      id: `announcement-${item.id}`,
      title: item.title,
      summary: item.body,
      time: item.priority === 'High' ? 'Just now' : 'Today',
      tone: item.priority === 'Critical' ? 'alert' : 'normal'
    }));
    const incidents = (data.incidents || []).slice(0, 1).map((item) => ({
      id: `incident-${item.id}`,
      title: `${item.type} Incident Reported`,
      summary: item.description,
      time: 'Today',
      tone: 'alert'
    }));

    return [...announcements, ...incidents].slice(0, 3);
  }, [data.announcements, data.incidents]);

  const recentStudents = (data.students || []).slice(0, 3);
  const recentTeachers = (data.teachers || []).slice(0, 3);
  const recentGuardians = (data.guardians || []).slice(0, 3);

  const openSheet = (name) => setSheet?.(name);

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
                <p>{school.name || 'EduSafe PH Academy'}</p>
              </article>
              <article className="featureCard">
                <h3>School year</h3>
                <p>{school.year || '2026–2027'}</p>
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
                <p>{school.name || 'EduSafe PH Academy'}</p>
              </article>
              <article className="featureCard">
                <h3>School type</h3>
                <p>{school.type || 'Integrated School'}</p>
              </article>
              <article className="featureCard">
                <h3>School year</h3>
                <p>{school.year || '2026–2027'}</p>
              </article>
              <article className="featureCard">
                <h3>Campus contact</h3>
                <p>{school.contact || '+63 917 555 0148'}</p>
              </article>
            </section>

            <section className="featureList">
              <article className="featureCard">
                <h3>Address</h3>
                <p>{school.address || 'Mandaluyong City, Metro Manila'}</p>
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
            </div>
          </section>
        );
      case 'people':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>People registry</h2>
              <button className="smallBtn" type="button" onClick={() => setActiveTab('register')}>Back</button>
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
                <strong>{school.name || 'EduSafe PH Academy'}</strong>
              </div>
              <div>
                <p className="metricText">Role</p>
                <strong>Principal / System Administrator</strong>
              </div>
              <div>
                <p className="metricText">School year</p>
                <strong>{school.year || '2026–2027'}</strong>
              </div>
              <div>
                <p className="metricText">Verified guardians</p>
                <strong>{verifiedGuardians}</strong>
              </div>
            </div>
            <div className="profileActionRow">
              <button className="logoutPill" type="button" onClick={signOut}>
                <span className="material-symbols-outlined">logout</span>
                <span>Sign out of EduSafe</span>
              </button>
            </div>
          </section>
        );
      default:
        return (
          <>
            <section className="sectionTitleBlock">
              <span>{currentDate} • {school.type || 'Integrated School'}</span>
              <h2>{school.name || 'EduSafe PH Academy'}</h2>
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

            <section className="featureList">
              <article className="featureCard">
                <h3>Active Teachers</h3>
                <p>{teachers} accounts ready for attendance and dismissal.</p>
              </article>
              <article className="featureCard">
                <h3>Pending Forms</h3>
                <p>{pendingForms} parent responses awaiting completion.</p>
              </article>
              <article className="featureCard">
                <h3>Clinic Visits</h3>
                <p>{clinicVisits} health records logged today.</p>
              </article>
              <article className="featureCard">
                <h3>Incident Reports</h3>
                <p>{incidentsCount} active safety notes in the system.</p>
              </article>
            </section>

            <section className="sectionHeader">
              <h2>Quick Actions</h2>
              <button className="smallBtn" type="button" onClick={() => openSheet('announcement')}>Publish Notice</button>
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
            </section>
          </>
        );
    }
  };

  return (
    <div className="adminPage">
      <main className="adminContent">
        {renderTabContent()}
      </main>

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
