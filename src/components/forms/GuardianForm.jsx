import React, { useState } from 'react';
import { FormShell, Field, Select } from '../FormFields.jsx';

function GuardianForm({ close, actions, data }) {
  const studentOptions = (data.students || []).map((student) => `${student.id}:${student.name}`);
  const hasStudents = studentOptions.length > 0;
  const parseStudentId = (value) => String(value || '');
  const [form, setForm] = useState({
    name: '',
    relation: 'Mother',
    phone: '',
    studentId: parseStudentId(studentOptions[0]?.split(':')[0] ?? ''),
    verified: true,
    photo: '',
    validId: '',
    emergencyContact: ''
  });

  const handleSubmit = () => {
    const trimmedName = String(form.name || '').trim();
    const trimmedPhone = String(form.phone || '').trim();
    if (!trimmedName || !hasStudents) return;
    const payload = {
      ...form,
      name: trimmedName,
      phone: trimmedPhone,
      studentId: String(form.studentId || '').trim()
    };
    actions.addGuardian(payload);
    close();
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm({ ...form, photo: '' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, photo: reader.result || '' });
    reader.readAsDataURL(file);
  };

  return (
    <FormShell
      onSubmit={handleSubmit}
      submit="Save guardian"
      submitDisabled={!hasStudents}
    >
      <Field label="Guardian name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
      {!form.name ? <p className="fieldNote">Guardian name is required for pickup verification.</p> : null}
      <label className="field">
        <span>Photo</span>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
        {form.photo && <img src={form.photo} alt="Guardian preview" className="formImagePreview" />}
        <small className="fieldNote">Optional photo for pickup verification.</small>
      </label>
      <Select
        label="Relationship"
        value={form.relation}
        options={['Mother', 'Father', 'Grandfather', 'Grandmother', 'Aunt', 'Uncle', 'School Service Driver', 'Other']}
        onChange={(relation) => setForm({ ...form, relation })}
      />
      <Field label="Phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
      <Field label="Valid ID (optional)" value={form.validId} onChange={(validId) => setForm({ ...form, validId })} />
      <Field label="Emergency contact" value={form.emergencyContact} onChange={(emergencyContact) => setForm({ ...form, emergencyContact })} />
      <Select
        label="Student"
        value={form.studentId}
        options={studentOptions.length ? studentOptions : ['']}
        onChange={(studentId) => setForm({ ...form, studentId: parseStudentId(studentId.split(':')[0]) })}
      />
      <Select label="Verification" value={form.verified ? 'Verified' : 'Pending'} options={['Verified', 'Pending']} onChange={(verified) => setForm({ ...form, verified: verified === 'Verified' })} />
      {!form.phone ? <p className="fieldNote">Phone is recommended for emergency and pickup coordination.</p> : null}
      {!hasStudents && <p className="fieldNote">Add a student first before assigning a guardian.</p>}
    </FormShell>
  );
}

export { GuardianForm };