import React, { useState } from 'react';
import { FormShell, Field, Select } from '../FormFields.jsx';

function AnnouncementForm({ close, actions }) {
  const [form, setForm] = useState({ title: '', audience: 'All', body: '', priority: 'Normal' });
  return <FormShell onSubmit={() => { actions.addAnnouncement(form); close(); }} submit="Publish">
    <Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
    <Select label="Audience" value={form.audience} options={['All', 'Grade Level', 'Section', 'Teachers', 'Parents']} onChange={(audience) => setForm({ ...form, audience })} />
    <Select label="Priority" value={form.priority} options={['Normal', 'High', 'Critical']} onChange={(priority) => setForm({ ...form, priority })} />
    <Field label="Message" value={form.body} onChange={(body) => setForm({ ...form, body })} multiline />
  </FormShell>;
}

export { AnnouncementForm };
