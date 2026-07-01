import React from 'react';

function Activity({ item }) {
  return <article className={`activity ${item.priority?.toLowerCase()}`}><div><h3>{item.title}</h3><p>{item.body}</p></div><span>{item.audience}</span></article>;
}

export { Activity };
