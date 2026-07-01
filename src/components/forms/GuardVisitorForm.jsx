import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { FormShell, Field, Select } from '../FormFields.jsx';

function GuardVisitorForm({ close, actions }) {
  const [form, setForm] = useState({
    name: '',
    purpose: '',
    person: '',
    contact: '',
    category: 'Parent',
    idType: 'Presented'
  });

  return (
    <FormShell onSubmit={() => { actions.addVisitor(form); close(); }} submit="Generate visitor pass">
      <div className="photoCard">
        <button className="photoBtn" type="button">
          <Camera size={18} /> Capture visitor photo
        </button>
        <p>Snap a quick visitor photo, then issue the pass.</p>
      </div>
      <Field label="Visitor name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
      <Field label="Contact number" value={form.contact} onChange={(contact) => setForm({ ...form, contact })} />
      <Select
        label="Visitor category"
        value={form.category}
        options={['Parent', 'Vendor', 'Delivery', 'Government', 'Maintenance', 'Other']}
        onChange={(category) => setForm({ ...form, category })}
      />
      <Field label="Purpose" value={form.purpose} onChange={(purpose) => setForm({ ...form, purpose })} />
      <Field label="Person to visit" value={form.person} onChange={(person) => setForm({ ...form, person })} />
      <Select
        label="ID type"
        value={form.idType}
        options={['Presented', 'Scanned', 'None']}
        onChange={(idType) => setForm({ ...form, idType })}
      />
    </FormShell>
  );
}

export { GuardVisitorForm };
