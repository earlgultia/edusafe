import React, { useMemo, useEffect } from 'react';

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

  const actions = useMemo(() => createAppActions(setData), [setData]);

  useEffect(() => {
    const loadLostFound = async () => {
      try {
        const res = await fetch('/api/lostfound');
        if (!res.ok) return;
        const json = await res.json();
        if (!Array.isArray(json.items)) return;

        const currentIds = (data.lostFound || []).map((item) => item.id);
        const merged = [
          ...json.items,
          ...(data.lostFound || []).filter((item) => !currentIds.includes(item.id))
        ];

        actions.setLostFound(merged);
      } catch (e) {
        // fallback to local store
      }
    };

    loadLostFound();
  }, [actions]);

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
      auth={session.auth}
      setAuth={session.setAuth}
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