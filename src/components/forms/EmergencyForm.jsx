import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

function EmergencyForm({ close, actions }) {
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('Follow school safety instructions immediately.');

  const types = ['Fire', 'Earthquake', 'Flood', 'Intruder', 'Medical Emergency'];

  const send = () => {
    const trimmedMessage = String(message || '').trim();
    if (!selected || !trimmedMessage) return;
    actions.triggerEmergency(selected, trimmedMessage);
    close();
  };

  return (
    <div className="emergencyChoices">
      {!selected ? (
        <div className="emergencyGrid">
          {types.map((type) => (
            <button key={type} type="button" onClick={() => setSelected(type)}>
              <AlertTriangle size={18} /> {type}
            </button>
          ))}
        </div>
      ) : (
        <div className="emergencyConfirm">
          <h3>{selected} — Confirm</h3>
          <label>
            Instructions
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
          </label>
          <div className="actionRow">
            <button className="smallBtn" type="button" onClick={send}>Send Alert</button>
            <button className="textButton" type="button" onClick={() => setSelected('')}>Back</button>
            <button className="textButton" type="button" onClick={close}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export { EmergencyForm };
