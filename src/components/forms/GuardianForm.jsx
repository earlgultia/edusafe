import React, { useState } from 'react';
import { FormShell, Field, Select } from '../FormFields.jsx';

function GuardianForm({ close, actions, data }) {
  const studentOptions = (data.students || []).map((student) => `${student.id}:${student.name}`);
  const hasStudents = studentOptions.length > 0;
  const [form, setForm] = useState({
    name: '',
    relation: 'Mother',
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
      submit="Save guardian"
      submitDisabled={!hasStudents}
    >
      <Field label="Guardian name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
      <Select label="Relationship" value={form.relation} options={['Mother', 'Father', 'Guardian', 'Grandparent', 'Sibling', 'Driver', 'Other']} onChange={(relation) => setForm({ ...form, relation })} />
      <Field label="Phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
      <Select
        label="Student"
        value={form.studentId}
        options={studentOptions.length ? studentOptions : ['']}
        onChange={(studentId) => setForm({ ...form, studentId: studentId.split(':')[0] })}
      />
      <Select label="Verification" value={form.verified ? 'Verified' : 'Pending'} options={['Verified', 'Pending']} onChange={(verified) => setForm({ ...form, verified: verified === 'Verified' })} />
      {!hasStudents && <p className="fieldNote">Add a student first before assigning a guardian.</p>}
    </FormShell>
  );
}

export { GuardianForm };