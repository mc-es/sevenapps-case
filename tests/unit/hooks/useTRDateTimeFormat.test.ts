import { renderHook } from '@testing-library/react-native';

import { useTRDateTimeFormat } from '@/hooks/useTRDateTimeFormat';

describe('useTRDateTimeFormat', () => {
  it('returns a DateTimeFormat instance with default options', () => {
    const { result } = renderHook(() => useTRDateTimeFormat());

    expect(result.current).toBeInstanceOf(Intl.DateTimeFormat);

    const formatted = result.current.format(new Date('2025-01-02T15:30:00Z'));

    expect(formatted).toMatch(/\d{1,2}\.\d{2}\.\d{4}(?: \d{1,2}:\d{2})?/);
  });

  it('applies custom options (only dateStyle)', () => {
    const { result } = renderHook(() => useTRDateTimeFormat({ dateStyle: 'long' }));

    const formatted = result.current.format(new Date('2025-01-02T00:00:00Z'));

    expect(formatted).toMatch(
      /Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık/,
    );
  });

  it('memoizes by options JSON', () => {
    const { result, rerender } = renderHook<
      Intl.DateTimeFormat,
      { opt: Intl.DateTimeFormatOptions }
    >(({ opt }) => useTRDateTimeFormat(opt), { initialProps: { opt: { dateStyle: 'short' } } });
    const firstInstance = result.current;

    rerender({ opt: { dateStyle: 'short' } });
    expect(result.current).toBe(firstInstance);

    rerender({ opt: { dateStyle: 'long' } });
    expect(result.current).not.toBe(firstInstance);
  });
});
