import React, { useState } from 'react';
import { FormShell, Field, Select } from '../FormFields.jsx';

function SchoolForm({ close, actions, data }) {
  const [form, setForm] = useState({
    name: data.school?.name || '',
    type: data.school?.type || 'Integrated School',
    year: data.school?.year || '2026-2027',
    address: data.school?.address || '',
    contact: data.school?.contact || ''
  });

  return (
    <FormShell onSubmit={() => { actions.updateSchool(form); close(); }} submit="Save school profile">
      <Field label="School name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
      <Select
        label="School type"
        value={form.type}
        options={['Integrated School', 'Elementary School', 'High School', 'Senior High School', 'Private School', 'Public School']}
        onChange={(type) => setForm({ ...form, type })}
      />
      <Field label="School year" value={form.year} onChange={(year) => setForm({ ...form, year })} />
      <Field label="Address" value={form.address} onChange={(address) => setForm({ ...form, address })} />
      <Field label="Contact" value={form.contact} onChange={(contact) => setForm({ ...form, contact })} />
    </FormShell>
  );
}

export { SchoolForm };