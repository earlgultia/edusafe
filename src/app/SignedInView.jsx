import { ActionSheet } from '../components/ActionSheet.jsx';
import { AdminDashboard } from '../pages/dashboards/AdminDashboard.jsx';
import { AppChrome } from './AppChrome.jsx';

function SignedInView({ role, userName, signOut, data, stats, actions, sheet, setSheet }) {
  return (
    <div className="app">
      <AppChrome role={role} userName={userName} onSignOut={signOut} />

      <main className="screen">
        <AdminDashboard data={data} stats={stats} userName={userName} setSheet={setSheet} />
      </main>

      {sheet && <ActionSheet sheet={sheet} close={() => setSheet(null)} data={data} actions={actions} />}
    </div>
  );
}

export { SignedInView };