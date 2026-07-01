import React, { useState } from 'react';
import { FormShell, Field, Select } from '../FormFields.jsx';

function TeacherForm({ close, actions }) {
  const [form, setForm] = useState({
    employeeNo: '',
    name: '',
    birthday: '',
    contact: '',
    email: '',
    advisory: 'Grade 1 - A',
    position: 'Grade Adviser'
  });

  return (
    <FormShell onSubmit={() => { actions.addTeacher(form); close(); }} submit="Save teacher">
      <Field label="Employee No." value={form.employeeNo} onChange={(employeeNo) => setForm({ ...form, employeeNo })} />
      <Field label="Full name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
      <Field label="Birthday" value={form.birthday} onChange={(birthday) => setForm({ ...form, birthday })} />
      <Field label="Contact number" value={form.contact} onChange={(contact) => setForm({ ...form, contact })} />
      <Field label="Email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
      <Select
        label="Position"
        value={form.position}
        options={['Grade Adviser', 'Classroom Teacher', 'Nurse', 'Guard', 'Admin']}
        onChange={(position) => setForm({ ...form, position })}
      />
      <Field label="Advisory class" value={form.advisory} onChange={(advisory) => setForm({ ...form, advisory })} />
    </FormShell>
  );
}

export { TeacherForm };