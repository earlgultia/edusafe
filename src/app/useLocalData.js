import { useEffect, useState } from 'react';

import { initialData } from '../appContent.js';
import { readRemoteAppData, syncProfileToSupabase } from '../pages/authAccounts.js';

function hasDemoSeed(data) {
  return data?.school?.id === 'ESP-2026-001';
}

function useLocalData(userEmail = '') {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('edusafe-data');
    if (!saved) return initialData;

    const parsed = JSON.parse(saved);
    if (hasDemoSeed(parsed)) {
      localStorage.setItem('edusafe-data', JSON.stringify(initialData));
      return initialData;
    }

    return parsed;
  });

  useEffect(() => {
    let cancelled = false;

    const loadRemoteData = async () => {
      if (!userEmail) return;

      const remoteData = await readRemoteAppData();
      if (cancelled || !remoteData) return;

      localStorage.setItem('edusafe-data', JSON.stringify(remoteData));
      setData(remoteData);
    };

    void loadRemoteData();

    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  const update = (recipe) => {
    setData((current) => {
      const next = typeof recipe === 'function' ? recipe(current) : recipe;
      localStorage.setItem('edusafe-data', JSON.stringify(next));

      if (userEmail) {
        void syncProfileToSupabase({ email: userEmail }, next);
      }

      return next;
    });
  };

  return [data, update];
}

export { useLocalData };
