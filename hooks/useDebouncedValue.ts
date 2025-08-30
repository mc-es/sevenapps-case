import { useEffect, useState } from 'react';

export default function useDebouncedValue<T>(value: T, delay = 400): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return (): void => clearTimeout(id);
  }, [value, delay]);
  return v;
}
