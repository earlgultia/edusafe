import { useState } from 'react';

import { initialData } from '../appContent.js';

function hasDemoSeed(data) {
  return data?.school?.id === 'ESP-2026-001';
}

function useLocalData() {
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

  const update = (recipe) => {
    setData((current) => {
      const next = typeof recipe === 'function' ? recipe(current) : recipe;
      localStorage.setItem('edusafe-data', JSON.stringify(next));
      return next;
    });
  };

  return [data, update];
}

export { useLocalData };
