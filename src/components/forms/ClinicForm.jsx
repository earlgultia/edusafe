import React, { useState } from 'react';
import { FormShell, Field } from '../FormFields.jsx';

function ClinicForm({ close, actions, data }) {
  const [form, setForm] = useState({
    student: data?.students?.[0]?.name || '',
    reason: '',
    temp: '',
    medicine: 'None',
    treatment: '',
    disposition: 'Observed'
  });

  const handleSubmit = () => {
    const trimmedStudent = String(form.student || '').trim();
    const trimmedReason = String(form.reason || '').trim();
    if (!trimmedStudent || !trimmedReason) return;
    if (actions?.addClinic) {
      actions.addClinic({ ...form, student: trimmedStudent, reason: trimmedReason });
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
    <Field label="Disposition" value={form.disposition} onChange={(disposition) => setForm({ ...form, disposition })} />
    <Field label="Treatment" value={form.treatment} onChange={(treatment) => setForm({ ...form, treatment })} multiline />
    {!form.reason ? <p className="fieldNote">Reason is required for clinic review and follow-up.</p> : null}
  </FormShell>;
}

export { ClinicForm };
