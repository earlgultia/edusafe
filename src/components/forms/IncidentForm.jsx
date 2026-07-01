import React, { useState } from 'react';
import { FormShell, Field, Select } from '../FormFields.jsx';

function IncidentForm({ close, actions, data }) {
  const [form, setForm] = useState({ type: 'Bullying', student: data.students[0]?.name || '', description: '' });
  return <FormShell onSubmit={() => { actions.addIncident(form); close(); }} submit="Submit incident">
    <Select label="Type" value={form.type} options={['Bullying', 'Fighting', 'Injury', 'Property Damage', 'Theft', 'Other']} onChange={(type) => setForm({ ...form, type })} />
    <Field label="Student involved" value={form.student} onChange={(student) => setForm({ ...form, student })} />
    <Field label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} multiline />
  </FormShell>;
}

export { IncidentForm };
