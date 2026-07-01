import React from 'react';
import { X } from 'lucide-react';
import { StudentForm } from './forms/StudentForm.jsx';
import { TeacherForm } from './forms/TeacherForm.jsx';
import { GuardianForm } from './forms/GuardianForm.jsx';
import { SchoolForm } from './forms/SchoolForm.jsx';
import { AttendanceForm } from './forms/AttendanceForm.jsx';
import { PickupForm } from './forms/PickupForm.jsx';
import { VisitorForm } from './forms/VisitorForm.jsx';
import { GuardVisitorForm } from './forms/GuardVisitorForm.jsx';
import { IncidentForm } from './forms/IncidentForm.jsx';
import { ClinicForm } from './forms/ClinicForm.jsx';
import { AnnouncementForm } from './forms/AnnouncementForm.jsx';
import { EmergencyForm } from './forms/EmergencyForm.jsx';
import { ReleaseForm } from './forms/ReleaseForm.jsx';
import { BasicForm } from './forms/BasicForm.jsx';
import { GuardianQrSheet } from './forms/GuardianQrSheet.jsx';

function ActionSheet({ sheet, close, data, actions }) {
  const titles = {
    student: 'Add Student',
    teacher: 'Add Teacher',
    guardian: 'Add Guardian',
      school: 'School Setup',
    clinic: 'Clinic Record',
    announcement: 'Publish Announcement',
    emergency: 'Emergency Alert',
    release: 'Guardian Verification',
    form: 'Create Digital Form',
    guardian_qr: 'Guardian QR Passes',
    lost: 'Lost & Found Item'
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="sheet">
        <div className="sheetHead">
          <h2>{titles[sheet]}</h2>
          <button className="iconButton" onClick={close} aria-label="Close"><X size={20} /></button>
        </div>
        {sheet === 'student' && <StudentForm close={close} actions={actions} />}
        {sheet === 'attendance' && <AttendanceForm close={close} actions={actions} data={data} />}
        {sheet === 'pickup' && <PickupForm close={close} actions={actions} data={data} />}
        {sheet === 'visitor' && <VisitorForm close={close} actions={actions} />}
        {sheet === 'guard_visitor' && <GuardVisitorForm close={close} actions={actions} />}
        {sheet === 'incident' && <IncidentForm close={close} actions={actions} data={data} />}
        {sheet === 'clinic' && <ClinicForm close={close} actions={actions} data={data} />}
        {sheet === 'announcement' && <AnnouncementForm close={close} actions={actions} />}
        {sheet === 'emergency' && <EmergencyForm close={close} actions={actions} />}
        {sheet === 'release' && <ReleaseForm close={close} actions={actions} data={data} />}
        {sheet === 'teacher' && <TeacherForm close={close} actions={actions} />}
        {sheet === 'guardian' && <GuardianForm close={close} actions={actions} data={data} />}
        {sheet === 'guardian_qr' && <GuardianQrSheet close={close} data={data} />}
        {sheet === 'school' && <SchoolForm close={close} actions={actions} data={data} />}
        {sheet === 'form' && <BasicForm close={close} message="Digital form published to selected audience." />}
        {sheet === 'lost' && <BasicForm close={close} message="Lost item published for parent and student review." />}
      </div>
    </div>
  );
}
export { ActionSheet };
