import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { FormShell, Field, Select } from '../FormFields.jsx';

function VisitorForm({ close, actions }) {
  const [form, setForm] = useState({ name: '', purpose: '', person: '', contact: '', category: 'Parent', idType: 'Optional' });
  const handleSubmit = () => {
    const trimmedName = String(form.name || '').trim();
    const trimmedContact = String(form.contact || '').trim();
    if (!trimmedName || !trimmedContact) return;
    actions.addVisitor({ ...form, name: trimmedName, contact: trimmedContact });
    close();
  };
  return <FormShell onSubmit={handleSubmit} submit="Generate QR pass">
    <div className="photoCard">
      <button className="photoBtn" type="button"><Camera size={18} /> Capture visitor photo</button>
      <p>Take a quick photo, then generate a pass for the visitor.</p>
    </div>
    <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
    <Field label="Contact number" value={form.contact} onChange={(contact) => setForm({ ...form, contact })} />
    <Select label="Visitor type" value={form.category} options={['Parent', 'Vendor', 'Delivery', 'Government', 'Maintenance', 'Other']} onChange={(category) => setForm({ ...form, category })} />
    <Field label="Purpose" value={form.purpose} onChange={(purpose) => setForm({ ...form, purpose })} />
    <Field label="Person to visit" value={form.person} onChange={(person) => setForm({ ...form, person })} />
    <Select label="ID status" value={form.idType} options={['Optional', 'Presented', 'Scanned']} onChange={(idType) => setForm({ ...form, idType })} />
  </FormShell>;
}

export { VisitorForm };
