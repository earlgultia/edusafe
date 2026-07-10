import React, { useMemo, useState } from 'react';
import { FormShell, Field, Select } from '../FormFields.jsx';

function IncidentForm({ close, actions, data }) {
  const students = useMemo(() => (data?.students || []).filter(Boolean), [data?.students]);
  const guardians = useMemo(() => (data?.guardians || []).filter(Boolean), [data?.guardians]);
  const [form, setForm] = useState({
    type: 'Bullying',
    student: students[0]?.name || '',
    studentId: students[0]?.id || '',
    description: '',
    guardianIds: [],
    notifyAll: false
  });

  const selectedStudent = students.find((student) => student.id === form.studentId) || students.find((student) => student.name === form.student) || students[0] || null;
  const studentGuardians = useMemo(() => {
    if (!selectedStudent?.id) return [];
    return guardians.filter((guardian) => String(guardian.studentId || '') === String(selectedStudent.id));
  }, [guardians, selectedStudent]);

  const toggleGuardian = (guardianId) => {
    setForm((current) => ({
      ...current,
      guardianIds: current.guardianIds.includes(guardianId)
        ? current.guardianIds.filter((id) => id !== guardianId)
        : [...current.guardianIds, guardianId]
    }));
  };

  const handleStudentChange = (studentId) => {
    const nextStudent = students.find((student) => student.id === studentId) || null;
    setForm((current) => ({
      ...current,
      student: nextStudent?.name || '',
      studentId: nextStudent?.id || '',
      guardianIds: []
    }));
  };

  const handleSubmit = () => {
    const resolvedGuardianIds = form.notifyAll
      ? studentGuardians.map((guardian) => guardian.id)
      : form.guardianIds;

    actions.addIncident({
      type: form.type,
      student: form.student,
      studentId: form.studentId,
      description: form.description,
      guardianIds: resolvedGuardianIds,
      notifyAll: form.notifyAll
    });
    close();
  };

  return (
    <FormShell onSubmit={handleSubmit} submit="Submit incident">
      <Select label="Type" value={form.type} options={['Bullying', 'Fighting', 'Injury', 'Property Damage', 'Theft', 'Other']} onChange={(type) => setForm({ ...form, type })} />
      <label className="field">
        <span>Student involved</span>
        <select value={form.studentId} onChange={(event) => handleStudentChange(event.target.value)}>
          {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
        </select>
      </label>
      {studentGuardians.length > 0 && (
        <div className="field">
          <span>Notify parent / guardian</span>
          <div style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>
            {studentGuardians.map((guardian) => (
              <label key={guardian.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={form.guardianIds.includes(guardian.id)} onChange={() => toggleGuardian(guardian.id)} />
                <span>{guardian.name} ({guardian.relation || 'Guardian'})</span>
              </label>
            ))}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={form.notifyAll} onChange={() => setForm((current) => ({ ...current, notifyAll: !current.notifyAll, guardianIds: !current.notifyAll ? studentGuardians.map((guardian) => guardian.id) : [] }))} />
              <span>Notify all guardians for this class</span>
            </label>
          </div>
        </div>
      )}
      <Field label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} multiline />
    </FormShell>
  );
}

export { IncidentForm };
