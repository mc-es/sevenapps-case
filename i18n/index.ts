import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { AppLanguages } from './resources';
import { resources } from './resources';

const STORAGE_KEY = 'app.lang';

const detectLanguage = async (): Promise<AppLanguages> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'tr') return saved as AppLanguages;
  } catch {}
  const device = Localization.getLocales()[0]?.languageCode?.toLowerCase();
  return device === 'tr' ? 'tr' : 'en';
};

const changeLanguage = async (lang: AppLanguages): Promise<void> => {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(STORAGE_KEY, lang);
};

const setupI18n = async (): Promise<typeof i18n> => {
  const lng = await detectLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: { escapeValue: false },
    returnNull: false,
    ns: ['translation'],
    defaultNS: 'translation',
  });

  return i18n;
};

export { changeLanguage, i18n, setupI18n };
