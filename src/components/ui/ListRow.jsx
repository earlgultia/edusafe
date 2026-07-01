import React from 'react';
import { ChevronRight } from 'lucide-react';

function ListRow({ title, meta, right }) {
  return <article className="row"><div><h3>{title}</h3><p>{meta}</p></div><span className="status">{right}</span><ChevronRight size={16} /></article>;
}

export { ListRow };
