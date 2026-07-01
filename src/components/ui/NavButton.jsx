import React from 'react';

function NavButton({ icon: Icon, label, active, onClick, disabled }) {
  return <button className={`${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`} onClick={onClick} disabled={disabled}><Icon size={19} /><span>{label}</span></button>;
}

export { NavButton };
