import React from 'react';
import { QrCode } from 'lucide-react';

function PickupForm({ close, actions, data }) {
  return (
    <div className="list verifyList">
      {data.guardians.map((guardian) => {
        const student = data.students.find((item) => item.id === guardian.studentId);
        return (
          <article className="verifyCard" key={guardian.id}>
            <div className="qrBox"><QrCode size={30} /></div>
            <div>
              <h3>{guardian.name}</h3>
              <p>{guardian.relation} for {student?.name}</p>
              <small>{guardian.verified ? guardian.qr : 'Guardian not verified'}</small>
            </div>
            <button className={guardian.verified ? 'smallBtn' : 'smallBtn disabled'} type="button" onClick={() => { actions.releaseStudent(guardian.id); close(); }}>
              {guardian.verified ? 'Release' : 'Denied'}
            </button>
          </article>
        );
      })}
    </div>
  );
}

export { PickupForm };
