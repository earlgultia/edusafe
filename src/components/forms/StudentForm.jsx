import React, { useState } from 'react';
import { FormShell } from '../FormFields.jsx';

function StudentForm({ close, actions }) {
  const [form, setForm] = useState({ lrn: '', name: '', grade: '', section: '', gender: '', blood: '', guardian: '', status: '', medical: '' });
  const handleSubmit = () => {
    const parentEmail = String(form.guardian || '').trim();
    actions.addStudent({
      ...form,
      parentEmail: parentEmail.includes('@') ? parentEmail : ''
    });
    close();
  };
  return <FormShell onSubmit={handleSubmit} submit="Save student">
    <FieldRow label="LRN" value={form.lrn} onChange={(lrn) => setForm({ ...form, lrn })} />
    <FieldRow label="Full name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
    <FieldRow label="Grade" value={form.grade} onChange={(grade) => setForm({ ...form, grade })} />
    <FieldRow label="Section" value={form.section} onChange={(section) => setForm({ ...form, section })} />
    <FieldRow label="Guardian" value={form.guardian} onChange={(guardian) => setForm({ ...form, guardian })} />
    <FieldRow label="Medical conditions" value={form.medical} onChange={(medical) => setForm({ ...form, medical })} />
  </FormShell>;
}

function FieldRow({ label, value, onChange }) {
  return <label className="field"><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} required /></label>;
}

export { StudentForm };
