import React from 'react';
import { X } from 'lucide-react';
import { StudentForm } from './forms/StudentForm.jsx';
import { AttendanceForm } from './forms/AttendanceForm.jsx';
import { PickupForm } from './forms/PickupForm.jsx';
import { VisitorForm } from './forms/VisitorForm.jsx';
import { IncidentForm } from './forms/IncidentForm.jsx';
import { ClinicForm } from './forms/ClinicForm.jsx';
import { AnnouncementForm } from './forms/AnnouncementForm.jsx';
import { EmergencyForm } from './forms/EmergencyForm.jsx';
import { ReleaseForm } from './forms/ReleaseForm.jsx';
import { BasicForm } from './forms/BasicForm.jsx';

function ActionSheet({ sheet, close, data, actions }) {
  const titles = {
    student: 'Add Student',
    teacher: 'Add Teacher',
    attendance: 'Attendance',
    pickup: 'Guardian Pickup',
    visitor: 'New Visitor',
    incident: 'Incident Report',
    clinic: 'Clinic Record',
    announcement: 'Publish Announcement',
    emergency: 'Emergency Alert',
    release: 'Guardian Verification',
    form: 'Create Digital Form',
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
        {sheet === 'incident' && <IncidentForm close={close} actions={actions} data={data} />}
        {sheet === 'clinic' && <ClinicForm close={close} actions={actions} data={data} />}
        {sheet === 'announcement' && <AnnouncementForm close={close} actions={actions} />}
        {sheet === 'emergency' && <EmergencyForm close={close} actions={actions} />}
        {sheet === 'release' && <ReleaseForm close={close} actions={actions} data={data} />}
        {sheet === 'teacher' && <BasicForm close={close} message="Teacher account creation is queued for admin approval." />}
        {sheet === 'form' && <BasicForm close={close} message="Digital form published to selected audience." />}
        {sheet === 'lost' && <BasicForm close={close} message="Lost item published for parent and student review." />}
      </div>
    </div>
  );
}
export { ActionSheet };
