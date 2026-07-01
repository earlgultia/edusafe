import React from 'react';
import { AlertTriangle } from 'lucide-react';

function EmergencyForm({ close, actions }) {
  return <div className="emergencyChoices emergencyGrid">
    {['Fire', 'Earthquake', 'Flood', 'Intruder', 'Medical Emergency'].map((type) => (
      <button key={type} type="button" onClick={() => { actions.triggerEmergency(type); close(); }}><AlertTriangle size={18} /> {type}</button>
    ))}
  </div>;
}

export { EmergencyForm };
