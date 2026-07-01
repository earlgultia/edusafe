import { ActionSheet } from '../components/ActionSheet.jsx';
import { RoleDashboard } from '../pages/dashboards/RoleDashboard.jsx';
import { AppChrome } from './AppChrome.jsx';

function SignedInView({ role, userName, signOut, data, stats, actions, sheet, setSheet }) {
  return (
    <div className="app">
      <AppChrome role={role} userName={userName} onSignOut={signOut} />

      <main className="screen">
        <RoleDashboard role={role} data={data} stats={stats} userName={userName} setSheet={setSheet} signOut={signOut} />
      </main>

      {sheet && <ActionSheet sheet={sheet} close={() => setSheet(null)} data={data} actions={actions} />}
    </div>
  );
}

export { SignedInView };