import { create } from 'zustand';

export interface BearState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
}

export const useStore = create<BearState>((set) => ({
  bears: 0,
  increasePopulation: (): void => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: (): void => set({ bears: 0 }),
  updateBears: (newBears: number): void => set({ bears: newBears }),
}));
