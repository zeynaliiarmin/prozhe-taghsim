import { useState, useEffect } from 'react';
import { mergeSettings, defaultSettings } from '../config/defaultSettings';
import { readJson, writeJson } from '../utils/storage';
import { STORAGE_KEY } from '../config/constants';

export const useSettings = () => {
  const [settings, setSettings] = useState(() => mergeSettings(readJson(STORAGE_KEY.settings, null)));

  const saveSettings = (newSettings: any) => {
    const merged = mergeSettings(newSettings);
    setSettings(merged);
    writeJson(STORAGE_KEY.settings, merged);
  };

  return { settings, saveSettings };
};
