import { useMemo } from 'react';

const useTRDateTimeFormat = (
  options: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeStyle: 'short' },
): Intl.DateTimeFormat =>
  useMemo(() => new Intl.DateTimeFormat('tr-TR', options), [JSON.stringify(options)]);

export { useTRDateTimeFormat };
