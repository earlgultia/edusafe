import { Bell, Home, Menu, Megaphone, FileText, ShieldCheck, Users } from 'lucide-react';

import { today } from '../appContent.js';
import { NavButton } from '../components/SharedUI.jsx';

function AppChrome({ role, userName, roleNames, tab, onSignIn, onSignOut, onTabChange, isTabAllowed }) {
  return (
    <>
      <header className="topbar">
        <button className="iconButton" aria-label="Menu"><Menu size={20} /></button>
        <div>
          <p>{today}</p>
          <h1>EduSafe PH</h1>
          <small className="sessionRole">{role}</small>
          <small className="sessionUser">{userName}</small>
        </div>
        <button className="iconButton alertDot" aria-label="Notifications"><Bell size={20} /></button>
      </header>

      <section className="roleStrip">
        {roleNames.map((item) => (
          <button key={item} className={role === item ? 'active' : ''} onClick={() => onSignIn(item)}>{item}</button>
        ))}
        <button className="signOutBtn" onClick={onSignOut}>Sign out</button>
      </section>

      <nav className="nav">
        <NavButton icon={Home} label="Home" active={tab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
        <NavButton icon={Users} label="People" active={tab === 'people'} onClick={() => (isTabAllowed(role, 'people') ? onTabChange('people') : onTabChange('dashboard'))} disabled={!isTabAllowed(role, 'people')} />
        <NavButton icon={ShieldCheck} label="Safety" active={tab === 'safety'} onClick={() => (isTabAllowed(role, 'safety') ? onTabChange('safety') : onTabChange('dashboard'))} disabled={!isTabAllowed(role, 'safety')} />
        <NavButton icon={Megaphone} label="Comms" active={tab === 'comms'} onClick={() => (isTabAllowed(role, 'comms') ? onTabChange('comms') : onTabChange('dashboard'))} disabled={!isTabAllowed(role, 'comms')} />
        <NavButton icon={FileText} label="Reports" active={tab === 'reports'} onClick={() => (isTabAllowed(role, 'reports') ? onTabChange('reports') : onTabChange('dashboard'))} disabled={!isTabAllowed(role, 'reports')} />
      </nav>
    </>
  );
}

export { AppChrome };