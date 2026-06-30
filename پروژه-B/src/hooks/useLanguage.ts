import { useState, useEffect } from 'react';
import { readJson, writeJson } from '../utils/storage';

export type Lang = 'fa' | 'en';

export const useLanguage = (defaultLang: Lang = 'fa') => {
  const [lang, setLang] = useState<Lang>(() => readJson('zkid_lang', defaultLang));

  useEffect(() => {
    writeJson('zkid_lang', lang);
  }, [lang]);

  return { lang, setLang };
};