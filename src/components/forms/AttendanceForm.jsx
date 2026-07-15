import React, { useState } from 'react';
import { FormShell, Select } from '../FormFields.jsx';

function AttendanceForm({ close, actions, data }) {
  const students = Array.isArray(data?.students) ? data.students : [];
  const [feedback, setFeedback] = useState('');
  const [studentStatuses, setStudentStatuses] = useState(() => Object.fromEntries(students.map((student) => [student.id, student.status])));
  const gradeOptions = ['All grades', ...new Set(students.map((student) => student.grade).filter(Boolean))];
  const sectionOptions = ['All sections', ...new Set(students.map((student) => student.section).filter(Boolean))];
  const [grade, setGrade] = useState('All grades');
  const [section, setSection] = useState('All sections');
  const filteredStudents = students.filter((student) => {
    const matchesGrade = grade === 'All grades' || student.grade === grade;
    const matchesSection = section === 'All sections' || student.section === section;
    return matchesGrade && matchesSection;
  });
  const statuses = ['Present', 'Absent', 'Late', 'Excused'];

  return (
    <div className="form attendanceForm">
      <div className="attendanceFilters">
        <Select label="Grade" value={grade} options={gradeOptions} onChange={setGrade} />
        <Select label="Section" value={section} options={sectionOptions} onChange={setSection} />
      </div>
      {feedback ? <p className="fieldNote">{feedback}</p> : null}
      <div className="attendanceList">
        {filteredStudents.map((student) => (
          <article className="attendanceRow" key={student.id}>
            <div>
              <h3>{student.name}</h3>
              <p>{student.lrn}</p>
            </div>
            <div className="chips attendanceChips">
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={studentStatuses[student.id] === status ? 'selected' : ''}
                  onClick={() => {
                    if (!student?.id || !actions?.markAttendance) return;
                    actions.markAttendance(student.id, status);
                    setStudentStatuses((current) => ({ ...current, [student.id]: status }));
                    setFeedback(`${student.name} marked ${status}`);
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </article>
        ))}
        {!filteredStudents.length && <p className="emptyText">No students available for attendance.</p>}
      </div>
      <button className="submitBtn" type="button" onClick={close}>Done</button>
    </div>
  );
}

export { AttendanceForm };
