import { ActionSheet } from '../components/ActionSheet.jsx';
import { LogoutSweetAlert } from '../components/LogoutSweetAlert.jsx';
import { RoleDashboard } from '../pages/dashboards/RoleDashboard.jsx';
import { AppChrome } from './AppChrome.jsx';
import { useState } from 'react';

function SignedInView({ role, userName, auth, setAuth, signOut, data, stats, actions, sheet, setSheet }) {
  const [logoutOpen, setLogoutOpen] = useState(false);

  const requestSignOut = () => setLogoutOpen(true);
  const confirmSignOut = () => {
    setLogoutOpen(false);
    signOut();
  };

  return (
    <div className="app">
      <AppChrome role={role} userName={userName} onSignOut={requestSignOut} data={data} actions={actions} />

      <main className="screen">
        <RoleDashboard role={role} data={data} stats={stats} userName={userName} auth={auth} setAuth={setAuth} setSheet={setSheet} signOut={requestSignOut} actions={actions} />
      </main>

      {sheet && <ActionSheet sheet={sheet} close={() => setSheet(null)} data={data} actions={actions} />}
      <LogoutSweetAlert
        open={logoutOpen}
        role={role}
        userName={userName}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={confirmSignOut}
      />
    </div>
  );
}

export { SignedInView };
