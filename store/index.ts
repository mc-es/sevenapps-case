import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UiState {
  nextListCounter: number;
  bump: () => void;
  set: (n: number) => void;
}

const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      nextListCounter: 1,
      bump: (): void => set({ nextListCounter: get().nextListCounter + 1 }),
      set: (n): void => set({ nextListCounter: n }),
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

const useUiHydrated = (): boolean => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useUiStore.persist?.onFinishHydration?.(() => setHydrated(true));
    setHydrated(useUiStore.persist?.hasHydrated?.() ?? false);

    return unsub;
  }, []);

  return hydrated;
};

export { useUiHydrated, useUiStore };
