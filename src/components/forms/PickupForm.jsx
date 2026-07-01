import React from 'react';
import { QrCode } from 'lucide-react';

function PickupForm({ close, actions, data }) {
  const guardians = data.guardians || [];

  return (
    <div className="list verifyList">
      {guardians.map((guardian) => {
        const student = (data.students || []).find((item) => item.id === guardian.studentId);
        return (
          <article className="verifyCard" key={guardian.id}>
            <div className="qrBox"><QrCode size={30} /></div>
            <div>
              <h3>{guardian.name}</h3>
              <p>{guardian.relation} for {student?.name || 'Unknown student'}</p>
              <small>{guardian.verified ? guardian.qr : 'Guardian not verified'}</small>
            </div>
            <button className={guardian.verified ? 'smallBtn' : 'smallBtn disabled'} type="button" onClick={() => { actions.releaseStudent(guardian.id); close(); }}>
              {guardian.verified ? 'Release' : 'Denied'}
            </button>
          </article>
        );
      })}
      {!guardians.length && <p className="emptyText">No guardians available for pickup.</p>}
    </div>
  );
}

export { PickupForm };
