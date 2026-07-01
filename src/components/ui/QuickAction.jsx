import React from 'react';

function QuickAction({ icon: Icon, title, text, onClick, danger }) {
  return <button className={`quick ${danger ? 'danger' : ''}`} onClick={onClick}><Icon size={20} /><strong>{title}</strong><span>{text}</span></button>;
}

export { QuickAction };
