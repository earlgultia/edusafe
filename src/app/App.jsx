import React, { useMemo, useState } from 'react';

import { ActionSheet } from '../components/ActionSheet.jsx';
import { EntryScreen, AccessBlocked } from '../pages/EntryScreen.jsx';
import { DashboardPage, PeoplePage, SafetyPage, CommsPage, ReportsPage } from '../pages/AppPages.jsx';
import { AppChrome } from './AppChrome.jsx';
import { createAppActions } from './appActions.js';
import { getAllowedTabs, getDashboardStats, isTabAllowed, roleNames } from './appViewModel.js';
import { useLocalData } from './useLocalData.js';

function App() {
  const [data, setData] = useLocalData();
  const [tab, setTab] = useState('dashboard');
  const [auth, setAuth] = useState({ signedIn: false, role: 'Admin' });
  const [sheet, setSheet] = useState(null);
  const [entryView, setEntryView] = useState('landing');
  const [entryRole, setEntryRole] = useState('Admin');
  const role = auth.role;

  const signIn = (nextRole) => {
    setAuth({ signedIn: true, role: nextRole });
    setTab('dashboard');
    setEntryView('landing');
  };

  const signOut = () => {
    setAuth({ signedIn: false, role: 'Admin' });
    setSheet(null);
    setTab('dashboard');
    setEntryView('landing');
  };

  const stats = useMemo(() => getDashboardStats(data), [data]);

  const allowedTabs = getAllowedTabs(role);

  const actions = createAppActions(setData);

  if (!auth.signedIn) {
    return (
      <EntryScreen
        view={entryView}
        role={entryRole}
        setRole={setEntryRole}
        setView={setEntryView}
        signIn={signIn}
      />
    );
  }

  return (
    <div className="app">
      <AppChrome
        role={role}
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

export { App };