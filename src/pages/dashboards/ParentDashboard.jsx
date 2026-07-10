import React, { useEffect, useState } from 'react';
import { CalendarView } from '../../components/CalendarView.jsx';
import { PeopleSheet } from '../../components/PeopleSheet.jsx';

function ParentDashboard({ data = {}, userName = 'Parent', auth = {}, setAuth = () => {}, setSheet, signOut, actions }) {
  const [activeTab, setActiveTab] = useState('home');
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimItem, setClaimItem] = useState(null);
  const [claimContact, setClaimContact] = useState('');
  const [claimantName, setClaimantName] = useState(userName);
  const [claimError, setClaimError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ fullName: auth.fullName || userName, email: auth.email || '' });
  const students = data.students || [];
  const guardians = data.guardians || [];
  
  // determine which students are linked to this authenticated guardian (parent)
  const guardianStudentIds = new Set(
    (guardians || [])
      .filter((g) => {
        if (!g) return false;
        // match by guardian email, id, or name to the current auth record
        if (auth?.email && g.email && String(g.email).toLowerCase() === String(auth.email).toLowerCase()) return true;
        if (auth?.id && g.id && String(g.id) === String(auth.id)) return true;
        if (auth?.fullName && g.name && String(g.name) === String(auth.fullName)) return true;
        return false;
      })
      .map((g) => g.studentId)
      .filter(Boolean)
  );

  const linkedStudentIds = Array.from(guardianStudentIds).filter((studentId) => students.some((student) => String(student.id) === String(studentId)));

  // students visible to the signed-in parent: only students explicitly linked through a guardian record
  const visibleStudents = students.filter((s) => linkedStudentIds.includes(String(s.id)));
  
  // filter announcements and notifications to only those for linked students or broadcast to all parents
  const filteredAnnouncements = (data.announcements || []).filter((a) => {
    // show if no studentId specified (broadcast) or if studentId matches one of parent's linked students
    if (!a.studentId) return true;
    return visibleStudents.some((s) => s.id === a.studentId);
  });
  const announcements = filteredAnnouncements;
  const defaultStudentId = visibleStudents[0] ? String(visibleStudents[0].id) : '';
  const currentStudentId = selectedStudentId || defaultStudentId;
  const selectedStudent = visibleStudents.find((child) => String(child.id) === currentStudentId) || {};
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
  const auditEntries = (data.auditLog || []).slice(0, 3);
  const offlineQueueSize = (data.offlineQueue || []).length;
  const showChildSelector = visibleStudents.length > 0;
  useEffect(() => {
    if (!visibleStudents.length) {
      setSelectedStudentId('');
      return;
    }

    const currentSelectionExists = visibleStudents.some((student) => String(student.id) === String(selectedStudentId));
    if (!currentSelectionExists) {
      setSelectedStudentId(String(visibleStudents[0].id));
    }
  }, [selectedStudentId, visibleStudents]);
  const openSheet = (sheet) => setSheet?.(sheet);
  const openClaimSheet = (item) => {
    setClaimItem(item);
    setClaimContact('');
    setClaimantName(userName || '');
    setClaimError('');
    setClaimOpen(true);
  };
  const handleClaimSubmit = async () => {
    const trimmedName = String(claimantName || '').trim();
    const trimmedContact = String(claimContact || '').trim();

    if (!trimmedName) {
      setClaimError('Please enter your name so staff can verify the claim.');
      return;
    }

    if (!trimmedContact) {
      setClaimError('Please add a phone number or email so staff can reach you.');
      return;
    }

    setClaimError('');

    if (actions && actions.claimLostItem) {
      actions.claimLostItem(claimItem.id, trimmedName, trimmedContact);
    }

    try {
      const res = await fetch(`/api/lostfound/${claimItem.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimant: trimmedName, contact: trimmedContact })
      });
      if (res.ok) {
        if (window.showToast) window.showToast('Claim submitted');
      } else if (window.showToast) {
        window.showToast('Claim submitted (local)');
      }
    } catch (e) {
      if (window.showToast) window.showToast('Claim submitted (local)');
    }

    setClaimOpen(false);
  };
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

            {showChildSelector && (
              <section className="sectionHeader">
                <div>
                  <p className="sectionLabel">Switch child profile</p>
                  <select className="childSelect" aria-label="Switch child profile" value={currentStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
                    {visibleStudents.map((child) => (
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
              <button type="button" className="actionCard" onClick={() => openSheet('guardian')}>
                <span className="material-symbols-outlined">person_add_alt</span>
                <div>
                  <strong>Add trusted adult</strong>
                  <small>Register a guardian and generate a QR pass.</small>
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
              <button type="button" className="actionCard" aria-label="Open lost and found details" onClick={() => setActiveTab('lostFound')}>
                <span className="material-symbols-outlined">inventory</span>
                <div>
                  <strong>Lost & Found</strong>
                  <small>Browse found items or claim yours.</small>
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
              <article className="featureCard">
                <h3>Audit trail</h3>
                <p>{auditEntries.length} visible entries</p>
              </article>
              <article className="featureCard">
                <h3>Offline queue</h3>
                <p>{offlineQueueSize} pending</p>
              </article>
            </section>

            <section className="sectionHeader">
              <div>
                <h2>Trusted adults</h2>
                <p className="sectionNote">Add parents, grandparents, caregivers, and school service drivers with QR pickup access.</p>
              </div>
              <button className="smallBtn" type="button" onClick={() => openSheet('guardian')}>Add trusted adult</button>
            </section>
            <div className="guardianPreview">
              {(childGuardians || []).slice(0, 3).map((guardian) => (
                <article key={guardian.id} className="guardianCard">
                  <div className="guardianAvatar">
                    {guardian.photo ? <img src={guardian.photo} alt={guardian.name} /> : <span>{guardian.name?.slice(0, 2)}</span>}
                  </div>
                  <div className="guardianDetails">
                    <h3>{guardian.name || 'Trusted adult'}</h3>
                    <p>{guardian.relation || 'Relationship not set'}</p>
                    <small>{guardian.phone || 'No phone provided'}</small>
                  </div>
                  <span className={`statusPill ${guardian.verified ? 'present' : 'pending'}`}>
                    {guardian.verified ? 'Verified' : 'Pending'}
                  </span>
                </article>
              ))}
              {!childGuardians.length && <p className="emptyText">No trusted adults registered yet.</p>}
            </div>

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
            <section className="featureList">
              {auditEntries.map((entry) => (
                <article key={entry.id} className="reportRow">
                  <div>
                    <h3>{entry.action}</h3>
                    <p>{entry.details?.reason || 'Record updated'} · {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Unknown'}</p>
                  </div>
                  <span>Recorded</span>
                </article>
              ))}
              {!auditEntries.length && <p className="emptyText">No audit entries to display.</p>}
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
      case 'lostFound':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <h2>Lost & Found</h2>
              <p className="sectionNote">Browse items found at school. Claim if it's yours.</p>
            </div>
            <div className="featureList">
              {(data.lostFound || []).map((it) => (
                <article key={it.id} className="reportRow">
                  <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                    {it.photo && <img src={it.photo} alt={it.item || 'found item'} className="lostThumb" onClick={() => setPreviewImage(it.photo)} />}
                    <div>
                      <h3>{it.item || it.description || 'Unnamed item'}</h3>
                      <p>{it.location} · {it.date}</p>
                      {it.description && <small>{it.description}</small>}
                    </div>
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                    <span>{it.status}</span>
                    {it.status !== 'Returned' && <button className="smallBtn" type="button" onClick={() => openClaimSheet(it)}>Claim</button>}
                  </div>
                </article>
              ))}
              {!(data.lostFound || []).length && <p className="emptyText">No items found yet.</p>}
            </div>

            {claimOpen && claimItem && (
              <div className="overlay" role="dialog">
                <div className="sheet">
                  <div className="sheetHead">
                    <h2>Claim item</h2>
                    <button className="iconButton" onClick={() => setClaimOpen(false)}>Close</button>
                  </div>
                  <div className="sheetBody">
                    {claimItem.photo && <img src={claimItem.photo} alt="item" style={{maxWidth: '100%', borderRadius: 8, marginBottom: 8}} />}
                    <p><strong>{claimItem.item || claimItem.description}</strong></p>
                    <label>
                      Your name
                      <input value={claimantName} onChange={(e) => setClaimantName(e.target.value)} autoComplete="name" required />
                    </label>
                    <label>
                      Contact (phone / email)
                      <input value={claimContact} onChange={(e) => setClaimContact(e.target.value)} placeholder="Phone or email" autoComplete="email" required />
                    </label>
                    {claimError ? <p className="authFeedback">{claimError}</p> : null}
                    <div className="actionRow">
                      <button className="smallBtn" type="button" onClick={handleClaimSubmit}>Submit claim</button>
                      <button className="textButton" type="button" onClick={() => setClaimOpen(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {previewImage && (
              <div className="imagePreviewOverlay" onClick={() => setPreviewImage(null)}>
                <img src={previewImage} alt="preview" />
              </div>
            )}
          </section>
        );
      case 'profile':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <div>
                <h2>Parent profile</h2>
                <p className="sectionNote">Manage your account and linked student details.</p>
              </div>
              <div className="sectionActions">
                <button className="smallBtn" type="button" onClick={() => {
                  if (!isEditingProfile) {
                    setProfileDraft({ fullName: auth.fullName || userName, email: auth.email || '' });
                  }
                  setIsEditingProfile((current) => !current);
                }}>
                  {isEditingProfile ? 'Cancel' : 'Edit profile'}
                </button>
              </div>
            </div>
            {isEditingProfile ? (
              <section className="profileEditForm">
                <article className="profileCard">
                  <div className="profileField">
                    <label>Full name</label>
                    <input value={profileDraft.fullName} onChange={(e) => setProfileDraft({ ...profileDraft, fullName: e.target.value })} />
                  </div>
                  <div className="profileField">
                    <label>Email</label>
                    <input type="email" value={profileDraft.email} onChange={(e) => setProfileDraft({ ...profileDraft, email: e.target.value })} />
                  </div>
                  <div className="actionRow">
                    <button className="smallBtn" type="button" onClick={() => {
                      const trimmedName = String(profileDraft.fullName || '').trim();
                      const trimmedEmail = String(profileDraft.email || '').trim();
                      if (!trimmedName || !trimmedEmail) return;
                      setAuth({ ...auth, fullName: trimmedName, email: trimmedEmail });
                      setIsEditingProfile(false);
                    }}>
                      Save profile
                    </button>
                  </div>
                </article>
              </section>
            ) : (
              <section className="profileSummary">
                <article className="profileCard">
                  <div>
                    <h3>{auth.fullName || userName}</h3>
                    <p>{selectedStudent.name ? `Parent of ${selectedStudent.name}` : 'No linked student yet'}</p>
                  </div>
                  <div>
                    <p>{auth.email || 'Email not set'}</p>
                    <p>{data.school?.name ? `School: ${data.school.name}` : 'School not established yet'}</p>
                    <p>{students.length} linked student{students.length === 1 ? '' : 's'}</p>
                  </div>
                </article>
              </section>
            )}
          </section>
        );
      case 'people':
        return (
          <section className="tabPage">
            <div className="sectionHeader">
              <div>
                <h2>Linked student profile</h2>
                <p className="sectionNote">View your linked child details without student deletion controls.</p>
              </div>
            </div>
            <PeopleSheet data={{ students: visibleStudents, teachers: [], guardians: childGuardians }} actions={actions} hideStudentDelete />
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
        <button className={`navButton ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
          <span className="material-symbols-outlined">calendar_month</span>
          <span>Calendar</span>
        </button>
        <button className={`navButton ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
          <span className="material-symbols-outlined">chat</span>
          <span>Messages</span>
        </button>
        <button className={`navButton ${activeTab === 'lostFound' ? 'active' : ''}`} onClick={() => setActiveTab('lostFound')}>
          <span className="material-symbols-outlined">inventory</span>
          <span>Lost & Found</span>
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

export { ParentDashboard };
