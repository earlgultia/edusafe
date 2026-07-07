import { LogOut } from 'lucide-react';
import { today } from '../appContent.js';
import { Notifications } from '../components/Notifications.jsx';
import { Toast } from '../components/Toast.jsx';

function AppChrome({ role, userName, onSignOut, data, actions }) {
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
        <Notifications notifications={data?.notifications} actions={actions} data={data} />
        <div className="userMeta">
          <span className="sessionRole">{role}</span>
          <span className="sessionUser">{userName}</span>
        </div>
        <button className="logoutButton topbarLogoutButton" type="button" onClick={onSignOut} aria-label="Log out">
          <LogOut aria-hidden="true" />
        </button>
      </div>
      <Toast />
    </header>
  );
}

export { AppChrome };
