import { LogOut } from 'lucide-react';
import { today } from '../appContent.js';

function AppChrome({ role, userName, onSignOut }) {
  const title = {
    Admin: 'Admin Dashboard',
    Teacher: 'Teacher Workspace',
    Parent: 'Parent Overview',
    Guard: 'Guard Console',
    Nurse: 'Nurse Station'
  }[role] || 'EduSafe PH';

  return (
    <header className="topbar">
      <div className="topbarBrand">
        <div className="brandLogo">ES</div>
        <div>
          <p>{today}</p>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="topbarActions">
        <div className="userMeta">
          <span className="sessionRole">{role}</span>
          <span className="sessionUser">{userName}</span>
        </div>
        {onSignOut ? (
          <button className="iconButton" type="button" onClick={onSignOut} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        ) : null}
      </div>
    </header>
  );
}

export { AppChrome };