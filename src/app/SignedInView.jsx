import React, { useState } from 'react';
import { ActionSheet } from '../components/ActionSheet.jsx';
import { LogoutSweetAlert } from '../components/LogoutSweetAlert.jsx';
import { RoleDashboard } from '../pages/dashboards/RoleDashboard.jsx';
import { AppChrome } from './AppChrome.jsx';

function SignedInView({ role, userName, auth, setAuth, signOut, data, stats, actions, sheet, setSheet }) {
  const [logoutOpen, setLogoutOpen] = useState(false);

  const requestSignOut = () => setLogoutOpen(true);
  const confirmSignOut = () => {
    setLogoutOpen(false);
    signOut();
  };

  const sheetData = (() => {
    const normalizedRole = String(role || '').trim().toLowerCase();
    if (normalizedRole !== 'teacher' && normalizedRole !== 'parent') return data;

    if (normalizedRole === 'teacher') {
      const normalizedTeacherEmail = String(auth?.email || '').trim().toLowerCase();
    const normalizedTeacherName = String(userName || '').trim().toLowerCase();
    const teacher = (data?.teachers || []).find((teacherProfile) => {
      const teacherEmail = String(teacherProfile.email || '').trim().toLowerCase();
      const teacherName = String(teacherProfile.name || '').trim().toLowerCase();
      return (teacherEmail && teacherEmail === normalizedTeacherEmail) || (teacherName && teacherName === normalizedTeacherName);
    });

      const teacherStudents = (data?.students || []).filter((student) => {
        const studentTeacherId = String(student.teacherId || '').trim();
        const currentTeacherId = String(teacher?.id || '').trim();
        const teacherGrade = String(teacher?.grade || '').trim().toLowerCase();
        const teacherSection = String(teacher?.section || '').trim().toLowerCase();
        const studentGrade = String(student.grade || '').trim().toLowerCase();
        const studentSection = String(student.section || '').trim().toLowerCase();
        const hasTeacherClass = Boolean(teacherGrade || teacherSection);

        if (currentTeacherId && studentTeacherId) {
          return studentTeacherId === currentTeacherId;
        }

        if (!hasTeacherClass) {
          return false;
        }

        if (teacherGrade && studentGrade && teacherGrade !== studentGrade) return false;
        if (teacherSection && studentSection && teacherSection !== teacherSection) return false;
        return true;
      });

      const linkedStudentIds = new Set(teacherStudents.map((student) => String(student.id)));

      return {
        ...data,
        students: teacherStudents,
        teachers: teacher ? [teacher] : (data?.teachers || []),
        guardians: (data?.guardians || []).filter((guardian) => linkedStudentIds.has(String(guardian.studentId || '')))
      };
    }

    const normalizeIdentifier = (value) => String(value || '').trim().toLowerCase();
    const parentEmail = normalizeIdentifier(auth?.email);
    const linkedStudents = (data?.students || []).filter((student) => {
      const studentParentEmail = normalizeIdentifier(student.parentEmail || student.guardianEmail || student.guardian || '');
      if (parentEmail && studentParentEmail && parentEmail === studentParentEmail) return true;
      return (data?.guardians || []).some((guardian) => {
        const guardianEmail = normalizeIdentifier(guardian.email || '');
        return String(guardian.studentId || '') === String(student.id) && Boolean(parentEmail && guardianEmail && parentEmail === guardianEmail);
      });
    });
    const linkedStudentIds = new Set(linkedStudents.map((student) => String(student.id)));

    return {
      ...data,
      students: linkedStudents,
      guardians: (data?.guardians || []).filter((guardian) => linkedStudentIds.has(String(guardian.studentId || ''))),
      announcements: (data?.announcements || []).filter((announcement) => {
        if (!announcement.studentId && !Array.isArray(announcement.studentIds)) return true;
        const targetIds = Array.isArray(announcement.studentIds) ? announcement.studentIds : [announcement.studentId];
        return targetIds.some((studentId) => linkedStudentIds.has(String(studentId)));
      }),
      notifications: (data?.notifications || []).filter((notification) => {
        if (!notification.studentId && !Array.isArray(notification.studentIds) && !Array.isArray(notification.guardianIds)) return true;
        const targetIds = Array.isArray(notification.studentIds) ? notification.studentIds : [notification.studentId];
        return targetIds.some((studentId) => linkedStudentIds.has(String(studentId)));
      })
    };
  })();

  return (
    <div className="app">
      <AppChrome role={role} userName={userName} onSignOut={requestSignOut} data={data} actions={actions} />

      <main className="screen">
        <RoleDashboard role={role} data={sheetData} stats={stats} userName={userName} auth={auth} setAuth={setAuth} setSheet={setSheet} signOut={requestSignOut} actions={actions} />
      </main>

      {sheet && <ActionSheet sheet={sheet} close={() => setSheet(null)} data={sheetData} actions={actions} />}
      <LogoutSweetAlert
        open={logoutOpen}
        role={role}
        userName={userName}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={confirmSignOut}
      />
    </div>
  );
}

export { SignedInView };
