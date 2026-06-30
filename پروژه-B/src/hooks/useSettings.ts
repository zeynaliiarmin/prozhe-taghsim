import { useState, useCallback } from 'react';
import { mergeSettings, defaultSettings } from '../config/defaultSettings';
import { readJson, writeJson } from '../utils/storage';
import { STORAGE_KEY } from '../config/constants';

export const useSettings = () => {
  const [settings, setSettings] = useState<Record<string, unknown>>(() =>
    mergeSettings(readJson(STORAGE_KEY.settings, null))
  );

  const saveSettings = useCallback((newSettings: Record<string, unknown>) => {
    const merged = mergeSettings(newSettings);
    setSettings(merged);
    writeJson(STORAGE_KEY.settings, merged);
  }, []);

  return { settings, saveSettings };
};