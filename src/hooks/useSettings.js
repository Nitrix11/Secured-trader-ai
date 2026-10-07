import { useCallback, useEffect, useState } from 'react';

const KEY = 'nat.settings';

function load() {
  let s = {};
  try {
    s = JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    s = {};
  }
  return {
    theme: ['auto', 'dark', 'light'].includes(s.theme) ? s.theme : 'auto',
  };
}

export function useSettings() {
  const [settings, setSettings] = useState(load);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);
  const update = useCallback((patch) => setSettings((prev) => ({ ...prev, ...patch })), []);
  return [settings, update];
}
