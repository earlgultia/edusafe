import { ActionSheet } from '../components/ActionSheet.jsx';
import { RoleDashboard } from '../pages/dashboards/RoleDashboard.jsx';
import { AppChrome } from './AppChrome.jsx';

function SignedInView({ role, userName, auth, setAuth, signOut, data, stats, actions, sheet, setSheet }) {
  return (
    <div className="app">
      <AppChrome role={role} userName={userName} onSignOut={signOut} data={data} actions={actions} />

      <main className="screen">
        <RoleDashboard role={role} data={data} stats={stats} userName={userName} auth={auth} setAuth={setAuth} setSheet={setSheet} signOut={signOut} actions={actions} />
      </main>

      {sheet && <ActionSheet sheet={sheet} close={() => setSheet(null)} data={data} actions={actions} />}
    </div>
  );
}

export { SignedInView };