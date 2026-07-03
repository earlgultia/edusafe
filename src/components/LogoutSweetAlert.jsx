function LogoutSweetAlert({ open, role, userName, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="sweetAlertBackdrop" role="presentation">
      <section className="sweetAlertCard" role="dialog" aria-modal="true" aria-labelledby="logout-alert-title">
        <div className="sweetAlertIcon" aria-hidden="true">
          <span className="material-symbols-outlined">logout</span>
        </div>
        <p className="sweetAlertEyebrow">End session</p>
        <h2 id="logout-alert-title">Log out of EduSafe?</h2>
        <p className="sweetAlertText">
          {userName ? `${userName}, your ${role || 'EduSafe'} session will be closed on this device.` : 'Your EduSafe session will be closed on this device.'}
        </p>
        <div className="sweetAlertActions">
          <button className="sweetAlertCancel" type="button" onClick={onCancel}>
            Stay signed in
          </button>
          <button className="sweetAlertConfirm" type="button" onClick={onConfirm}>
            Yes, log out
          </button>
        </div>
      </section>
    </div>
  );
}

export { LogoutSweetAlert };
