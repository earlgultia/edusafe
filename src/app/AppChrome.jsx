import { LogOut } from 'lucide-react';
import { today } from '../appContent.js';

function AppChrome({ role, userName, onSignOut }) {
  return (
    <header className="topbar">
      <div className="topbarBrand">
        <div className="brandLogo">ES</div>
        <div>
          <p>{today}</p>
          <h1>Admin Dashboard</h1>
        </div>
      </div>

      <div className="topbarActions">
        <div className="userMeta">
          <span className="sessionRole">{role}</span>
          <span className="sessionUser">{userName}</span>
        </div>
        <button className="iconButton" onClick={onSignOut} aria-label="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export { AppChrome };