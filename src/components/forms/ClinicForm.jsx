import React, { useState } from 'react';
import { FormShell, Field } from '../FormFields.jsx';

function ClinicForm({ close, actions, data }) {
  const [form, setForm] = useState({
    student: data?.students?.[0]?.name || '',
    reason: '',
    temp: '',
    medicine: 'None',
    treatment: ''
  });

  const handleSubmit = () => {
    if (actions?.addClinic) {
      actions.addClinic(form);
    }
    if (close) {
      close();
    }
  };

  return <FormShell onSubmit={handleSubmit} submit="Save clinic record">
    <Field label="Student" value={form.student} onChange={(student) => setForm({ ...form, student })} />
    <Field label="Reason" value={form.reason} onChange={(reason) => setForm({ ...form, reason })} />
    <Field label="Temperature" value={form.temp} onChange={(temp) => setForm({ ...form, temp })} />
    <Field label="Medicine" value={form.medicine} onChange={(medicine) => setForm({ ...form, medicine })} />
    <Field label="Treatment" value={form.treatment} onChange={(treatment) => setForm({ ...form, treatment })} multiline />
  </FormShell>;
}

export { ClinicForm };
