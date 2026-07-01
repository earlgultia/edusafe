import React, { useMemo } from 'react';

import { createAppActions } from './appActions.js';
import { getDashboardStats } from './appViewModel.js';
import { SignedInView } from './SignedInView.jsx';
import { SignedOutView } from './SignedOutView.jsx';
import { useAppSession } from './useAppSession.js';
import { useLocalData } from './useLocalData.js';

function App() {
  const [data, setData] = useLocalData();
  const session = useAppSession();
  const role = session.auth.role;

  const stats = useMemo(() => getDashboardStats(data), [data]);

  const actions = createAppActions(setData);

  if (!session.auth.signedIn) {
    return (
      <SignedOutView
        entryView={session.entryView}
        entryRole={session.entryRole}
        setEntryView={session.setEntryView}
        setEntryRole={session.setEntryRole}
        signIn={session.signIn}
      />
    );
  }

  return (
    <SignedInView
      role={role}
      userName={session.auth.fullName}
      signOut={session.signOut}
      data={data}
      stats={stats}
      actions={actions}
      sheet={session.sheet}
      setSheet={session.setSheet}
    />
  );
}

export { App };