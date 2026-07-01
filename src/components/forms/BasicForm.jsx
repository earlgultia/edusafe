import React from 'react';
import { Check } from 'lucide-react';

function BasicForm({ close, message }) {
  return <div className="basicConfirm">
    <Check size={34} />
    <p>{message}</p>
    <button className="submitBtn" onClick={close}>Done</button>
  </div>;
}

export { BasicForm };
