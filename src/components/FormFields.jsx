import React from 'react';

function FormShell({ children, onSubmit, submit, submitDisabled = false }) {
  return <form className="form" onSubmit={(event) => { event.preventDefault(); if (!submitDisabled) onSubmit(); }}>{children}<button className="submitBtn" type="submit" disabled={submitDisabled}>{submit}</button></form>;
}

function Field({ label, value, onChange, multiline }) {
  return <label className="field"><span>{label}</span>{multiline ? <textarea value={value} onChange={(e) => onChange(e.target.value)} required /> : <input value={value} onChange={(e) => onChange(e.target.value)} required />}</label>;
}

function Select({ label, value, onChange, options }) {
  return <label className="field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

export { FormShell, Field, Select };
