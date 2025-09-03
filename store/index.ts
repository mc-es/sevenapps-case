import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UiState {
  nextListCounter: number;
  bump: () => void;
  set: (n: number) => void;
  reset: () => void;
}

const useStore = create<UiState>()(
  persist(
    (set, get) => ({
      nextListCounter: 1,
      bump: (): void => set({ nextListCounter: get().nextListCounter + 1 }),
      set: (n): void => set({ nextListCounter: n }),
      reset: (): void => set({ nextListCounter: 1 }),
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

const useHydrated = (): boolean => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useStore.persist?.onFinishHydration?.(() => setHydrated(true));
    setHydrated(useStore.persist?.hasHydrated?.() ?? false);

    return unsub;
  }, []);

  return hydrated;
};

export { useHydrated, useStore };
