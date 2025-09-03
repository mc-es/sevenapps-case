import { cn } from '@/libs/cn';

describe('cn', () => {
  it('returns a single class', () => {
    expect(cn('btn')).toBe('btn');
  });

  it('merges multiple string classes', () => {
    expect(cn('p-2', 'mt-4')).toBe('p-2 mt-4');
  });

  it('supports conditional/array/object inputs (clsx behavior)', () => {
    const result = cn(
      ['p-2', false && 'hidden'],
      { hidden: true, visible: false },
      undefined,
      null,
      '',
      'rounded',
    );
    expect(result).toBe('p-2 hidden rounded');
  });

  it('deduplicates identical classes', () => {
    expect(cn('p-2', 'p-2', 'p-2')).toBe('p-2');
  });

  it('resolves conflicting Tailwind utilities with the last one (tailwind-merge)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('keeps non-conflicting utilities', () => {
    expect(cn('p-2', 'm-2')).toBe('p-2 m-2');
  });

  it('handles variant utilities (hover:, focus:, md:) correctly', () => {
    expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe('hover:bg-blue-500');
    expect(cn('md:p-2', 'p-4', 'md:p-6')).toBe('p-4 md:p-6');
  });

  it('passes through arbitrary (non-Tailwind) classes', () => {
    expect(cn('custom-class', { 'another-one': true })).toBe('custom-class another-one');
  });

  it('ignores falsy/empty values', () => {
    expect(cn(undefined, null, false, '', 'p-2')).toBe('p-2');
  });
});
