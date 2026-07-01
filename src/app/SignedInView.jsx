import { ActionSheet } from '../components/ActionSheet.jsx';
import { AccessBlocked } from '../pages/EntryScreen.jsx';
import { DashboardPage, PeoplePage, SafetyPage, CommsPage, ReportsPage } from '../pages/AppPages.jsx';
import { AppChrome } from './AppChrome.jsx';
import { isTabAllowed, roleNames } from './appViewModel.js';

function SignedInView({ role, userName, tab, setTab, signIn, signOut, data, stats, actions, sheet, setSheet }) {
  return (
    <div className="app">
      <AppChrome
        role={role}
        userName={userName}
        roleNames={roleNames}
        tab={tab}
        onSignIn={signIn}
        onSignOut={signOut}
        onTabChange={setTab}
        isTabAllowed={isTabAllowed}
      />

      <main className="screen">
        {tab === 'dashboard' && <DashboardPage data={data} stats={stats} role={role} setTab={setTab} setSheet={setSheet} />}
        {tab === 'people' && isTabAllowed(role, 'people') && <PeoplePage data={data} setSheet={setSheet} actions={actions} />}
        {tab === 'safety' && isTabAllowed(role, 'safety') && <SafetyPage data={data} setSheet={setSheet} actions={actions} />}
        {tab === 'comms' && isTabAllowed(role, 'comms') && <CommsPage data={data} setSheet={setSheet} />}
        {tab === 'reports' && isTabAllowed(role, 'reports') && <ReportsPage data={data} stats={stats} />}
        {!isTabAllowed(role, tab) && <AccessBlocked role={role} setTab={setTab} />}
      </main>

      {sheet && <ActionSheet sheet={sheet} close={() => setSheet(null)} data={data} actions={actions} />}
    </div>
  );
}

export { SignedInView };