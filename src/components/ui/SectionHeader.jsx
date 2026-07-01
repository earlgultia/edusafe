import React from 'react';
import { Plus } from 'lucide-react';

function SectionHeader({ title, action, onClick }) {
  return <div className="sectionHeader"><h2>{title}</h2>{action && <button onClick={onClick}><Plus size={16} />{action}</button>}</div>;
}

export { SectionHeader };
