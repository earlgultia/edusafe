import { useState } from 'react';

import { initialData } from '../appContent.js';

function useLocalData() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('edusafe-data');
    return saved ? JSON.parse(saved) : initialData;
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