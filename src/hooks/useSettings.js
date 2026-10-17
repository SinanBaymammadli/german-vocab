import { useState } from 'react';

const KEY = 'b1vocab_settings';

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? { levels: ['B1'] }; }
  catch { return { levels: ['B1'] }; }
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  function save(s) {
    localStorage.setItem(KEY, JSON.stringify(s));
    setSettings(s);
  }

  function setLevels(levels) {
    if (levels.length === 0) return; // always keep at least one
    save({ ...settings, levels });
  }

  return { settings, setLevels };
}
