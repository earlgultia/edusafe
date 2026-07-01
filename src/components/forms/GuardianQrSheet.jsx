import React, { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import QRCode from 'qrcode';

function GuardianQrSheet({ close, data }) {
  const guardians = data.guardians || [];
  const students = data.students || [];
  const [qrImages, setQrImages] = useState({});

  useEffect(() => {
    const loadQrImages = async () => {
      const items = {};
      await Promise.all(
        guardians.map(async (guardian) => {
          try {
            items[guardian.id] = await QRCode.toDataURL(guardian.qr || guardian.name, {
              errorCorrectionLevel: 'H',
              margin: 1,
              scale: 6
            });
          } catch (error) {
            console.error('QR generation failed', error);
            items[guardian.id] = '';
          }
        })
      );
      setQrImages(items);
    };

    loadQrImages();
  }, [guardians]);

  const copyCode = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
  };

  return (
    <div className="guardianQrSheet">
      <section className="sectionHeader">
        <h2>Guardian QR passes</h2>
        <p className="sectionNote">Share these codes with trusted adults for verified pickup access.</p>
      </section>

      <div className="featureList">
        {guardians.length > 0 ? (
          guardians.map((guardian) => {
            const student = students.find((s) => s.id === guardian.studentId);
            return (
              <article className="qrCard" key={guardian.id}>
                <div className="qrImageWrap">
                  {qrImages[guardian.id] ? (
                    <img src={qrImages[guardian.id]} alt={`${guardian.name} QR`} className="qrImage" />
                  ) : (
                    <div className="qrBadge">
                      <QrCode size={34} />
                    </div>
                  )}
                </div>
                <div>
                  <h3>{guardian.name}</h3>
                  <p>{guardian.relation} for {student?.name || 'your child'}</p>
                  <small>{guardian.qr}</small>
                </div>
                <button className="smallBtn" type="button" onClick={() => copyCode(guardian.qr)}>
                  Copy code
                </button>
              </article>
            );
          })
        ) : (
          <article className="featureCard">
            <p className="emptyText">No guardian QR passes yet. Add a guardian to generate one.</p>
          </article>
        )}
      </div>

      <div className="sheetActions">
        <button className="submitBtn" type="button" onClick={close}>Done</button>
      </div>
    </div>
  );
}

export { GuardianQrSheet };