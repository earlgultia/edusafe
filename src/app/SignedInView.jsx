import { ActionSheet } from '../components/ActionSheet.jsx';
import { LogoutSweetAlert } from '../components/LogoutSweetAlert.jsx';
import { RoleDashboard } from '../pages/dashboards/RoleDashboard.jsx';
import { AppChrome } from './AppChrome.jsx';
import { useState } from 'react';

function SignedInView({ role, userName, auth, setAuth, signOut, data, stats, actions, sheet, setSheet }) {
  const [logoutOpen, setLogoutOpen] = useState(false);

  const requestSignOut = () => setLogoutOpen(true);
  const confirmSignOut = () => {
    setLogoutOpen(false);
    signOut();
  };

  const sheetData = (() => {
    if (String(role || '').trim().toLowerCase() !== 'teacher') return data;

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
      if (currentTeacherId && studentTeacherId && studentTeacherId !== currentTeacherId) return false;
      if (currentTeacherId && studentTeacherId === currentTeacherId) return true;

      const teacherGrade = String(teacher?.grade || '').trim().toLowerCase();
      const teacherSection = String(teacher?.section || '').trim().toLowerCase();
      const studentGrade = String(student.grade || '').trim().toLowerCase();
      const studentSection = String(student.section || '').trim().toLowerCase();
      if (teacherGrade && studentGrade !== teacherGrade) return false;
      if (teacherSection && studentSection !== teacherSection) return false;
      return true;
    });

    const linkedStudentIds = new Set(teacherStudents.map((student) => String(student.id)));

    return {
      ...data,
      students: teacherStudents,
      teachers: teacher ? [teacher] : (data?.teachers || []),
      guardians: (data?.guardians || []).filter((guardian) => linkedStudentIds.has(String(guardian.studentId || '')))
    };
  })();

  return (
    <div className="app">
      <AppChrome role={role} userName={userName} onSignOut={requestSignOut} data={data} actions={actions} />

      <main className="screen">
        <RoleDashboard role={role} data={data} stats={stats} userName={userName} auth={auth} setAuth={setAuth} setSheet={setSheet} signOut={requestSignOut} actions={actions} />
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
