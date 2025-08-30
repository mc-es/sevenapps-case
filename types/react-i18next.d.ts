import type { resources } from '@/i18n/resources';
import 'react-i18next';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: (typeof resources)['en'];
    returnNull: false;
  }
}
