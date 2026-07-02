import React, { useState } from 'react';
import { FormShell, Field } from '../FormFields.jsx';

function EventForm({ close, actions }) {
  const [form, setForm] = useState({ title: '', date: '', location: '', details: '' });

  return (
    <FormShell onSubmit={() => { actions.addEvent(form); close(); }} submit="Save event">
      <Field label="Event title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
      <Field label="Date" value={form.date} onChange={(date) => setForm({ ...form, date })} />
      <Field label="Location" value={form.location} onChange={(location) => setForm({ ...form, location })} />
      <Field label="Details" value={form.details} onChange={(details) => setForm({ ...form, details })} multiline />
    </FormShell>
  );
}

export { EventForm };