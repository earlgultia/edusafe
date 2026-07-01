import React, { useState } from 'react';
import { FormShell, Select } from '../FormFields.jsx';

function AttendanceForm({ close, actions, data }) {
  const [grade, setGrade] = useState('Grade 1');
  const [section, setSection] = useState('A');
  const filteredStudents = data.students.filter((student) => student.grade === grade && student.section === section);
  const statuses = ['Present', 'Absent', 'Late', 'Excused'];

  return (
    <div className="form attendanceForm">
      <div className="attendanceFilters">
        <Select label="Grade" value={grade} options={['Grade 1', 'Grade 7']} onChange={setGrade} />
        <Select label="Section" value={section} options={['A', 'B']} onChange={setSection} />
      </div>
      <div className="attendanceList">
        {filteredStudents.map((student) => (
          <article className="attendanceRow" key={student.id}>
            <div>
              <h3>{student.name}</h3>
              <p>{student.lrn}</p>
            </div>
            <div className="chips attendanceChips">
              {statuses.map((status) => (
                <button key={status} type="button" className={student.status === status ? 'selected' : ''} onClick={() => actions.markAttendance(student.id, status)}>{status}</button>
              ))}
            </div>
          </article>
        ))}
      </div>
      <button className="submitBtn" type="button" onClick={close}>Done</button>
    </div>
  );
}

export { AttendanceForm };
