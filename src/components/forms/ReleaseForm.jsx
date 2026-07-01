import React from 'react';
import { QrCode } from 'lucide-react';

function ReleaseForm({ close, actions, data }) {
  const guardians = data.guardians || [];

  return <div className="list verifyList">
    {guardians.map((g) => {
      const student = (data.students || []).find((s) => s.id === g.studentId);
      return (
        <article className="verifyCard" key={g.id}>
          <div className="qrBox"><QrCode size={30} /></div>
          <div>
            <h3>{g.name}</h3>
            <p>{g.relation} for {student?.name || 'Unknown student'}</p>
            <small>{g.qr}</small>
          </div>
          <button className={g.verified ? 'smallBtn' : 'smallBtn disabled'} type="button" onClick={() => { actions.releaseStudent(g.id); close(); }}>
            {g.verified ? 'Release' : 'Denied'}
          </button>
        </article>
      );
    })}
    {!guardians.length && <p className="emptyText">No guardians available for release.</p>}
  </div>;
}

export { ReleaseForm };
