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

    const mergeAppData = (local, remote) => {
      if (!remote) return local;
      const merged = { ...local, ...remote };
      const sharedFields = ['students', 'teachers', 'guardians', 'attendanceLog'];

      sharedFields.forEach((field) => {
        const localField = local[field] || [];
        const remoteField = remote[field];

        if (remoteField === undefined) {
          merged[field] = localField;
          return;
        }

        if (Array.isArray(localField) && Array.isArray(remoteField)) {
          const remoteIds = new Set(remoteField.map((item) => item.id));
          merged[field] = [...remoteField, ...localField.filter((item) => !remoteIds.has(item.id))];
        }
      });

      return merged;
    };

    const loadRemoteData = async () => {
      if (!userEmail) return;

      const remoteData = await readRemoteAppData();
      if (cancelled || !remoteData) return;

      setData((current) => {
        const next = mergeAppData(current, remoteData);
        localStorage.setItem('edusafe-data', JSON.stringify(next));
        return next;
      });
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
