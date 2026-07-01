import React from 'react';

function Metric({ label, value, icon: Icon, tone = 'good' }) {
  return <article className={`metric ${tone}`}><Icon size={19} /><strong>{value}</strong><span>{label}</span></article>;
}

export { Metric };
