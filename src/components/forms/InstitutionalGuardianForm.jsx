import React, { useState } from 'react';
import { FormShell, Field, Select } from '../FormFields.jsx';

function InstitutionalGuardianForm({ close, actions, data }) {
  const studentOptions = (data.students || []).map((student) => `${student.id}:${student.name}`);
  const hasStudents = studentOptions.length > 0;
  const [form, setForm] = useState({
    name: '',
    relation: 'Institution',
    institution: '',
    phone: '',
    studentId: studentOptions[0]?.split(':')[0] ?? '',
    verified: true
  });

  return (
    <FormShell
      onSubmit={() => {
        if (!hasStudents) return;
        actions.addGuardian(form);
        close();
      }}
      submit="Save institutional guardian"
      submitDisabled={!hasStudents}
    >
      <Field label="Guardian name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
      <Field label="Phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
      <Field label="Institution name" value={form.institution} onChange={(institution) => setForm({ ...form, institution })} />
      <Select
        label="Relation"
        value={form.relation}
        options={['Institution', 'Driver', 'Coach', 'Security', 'Other']}
        onChange={(relation) => setForm({ ...form, relation })}
      />
      <Select label="Student" value={form.studentId} options={studentOptions.length ? studentOptions : ['']} onChange={(studentId) => setForm({ ...form, studentId: studentId.split(':')[0] })} />
      <Select
        label="Verification"
        value={form.verified ? 'Verified' : 'Pending'}
        options={['Verified', 'Pending']}
        onChange={(verified) => setForm({ ...form, verified: verified === 'Verified' })}
      />
      <p className="fieldNote">Institutional guardians can escort students and handle school-authorized pickups.</p>
      {!hasStudents && <p className="fieldNote">Add a student first before assigning an institutional guardian.</p>}
    </FormShell>
  );
}

export { InstitutionalGuardianForm };