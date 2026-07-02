import React, { useEffect, useState } from 'react';

function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    window.showToast = (msg, timeout = 3000) => {
      const id = Date.now();
      setToasts((t) => [...t, { id, msg }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timeout + 50);
    };
    return () => { window.showToast = null; };
  }, []);

  return (
    <div className="toastContainer">
      {toasts.map((t) => (
        <div key={t.id} className="toast">{t.msg}</div>
      ))}
    </div>
  );
}

export { Toast };
