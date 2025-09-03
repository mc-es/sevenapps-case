import en from './locales/en.json';
import tr from './locales/tr.json';

export const resources = {
  en: { translation: en },
  tr: { translation: tr },
} as const;

export type AppLanguages = keyof typeof resources;
